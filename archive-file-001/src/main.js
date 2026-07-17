import * as THREE from 'three';
import { SaveManager } from './core/SaveManager.js';
import { AudioManager } from './core/AudioManager.js';
import { InputManager } from './core/InputManager.js';
import { SettingsStore } from './core/SettingsStore.js';
import { applyStaticTranslations } from './core/i18n.js';
import { buildMaterialLibrary } from './world/Materials.js';
import { CollisionWorld } from './world/CollisionWorld.js';
import { PlayerController } from './world/PlayerController.js';
import { buildRotunda } from './world/buildRotunda.js';
import { buildRegistryWing } from './world/buildRegistryWing.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { CaseOneSystem } from './systems/CaseOneSystem.js';
import { UIController } from './ui/UIController.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { SPAWN_POSE, NORTH_WALL_Z } from './world/LevelLayout.js';
import { updateFlicker } from './world/Flicker.js';
import { IntroPan } from './world/IntroPan.js';
import { TouchControls } from './ui/TouchControls.js';

async function boot() {
  const ui = new UIController();
  ui.setLoadingProgress(0.1);

  const canvas = document.getElementById('scene-canvas');
  // Same detection InputManager uses, inlined here because antialias is a
  // context-creation flag — it has to be decided before the renderer (and
  // therefore before InputManager) exists. MSAA and a full-DPR canvas are
  // real per-fragment cost on a phone GPU; the corridor sightline (several
  // rooms' worth of lit surfaces stacked in one frustum) is exactly where
  // that cost peaked hard enough to report as frame drops.
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // A GPU that stalls for too long (exactly the kind of overload the
  // corridor view produces) can make the browser kill the WebGL context
  // outright — the canvas then goes blank/frozen and nothing we do to
  // scene contents matters until the context comes back. Without these two
  // listeners, three.js is never told to allow that recovery, so the loss
  // is permanent until the page is reloaded — this is what "objects
  // disappeared and stayed gone" actually was.
  let contextLost = false;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); // tells the browser a restoration attempt is wanted
    contextLost = true;
  }, false);
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
  }, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0a08);
  scene.fog = new THREE.FogExp2(0x0c0a08, 0.013);

  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.05, 80);

  scene.add(new THREE.HemisphereLight(0x8a7f68, 0x241c14, 0.9));

  ui.setLoadingProgress(0.3);
  const materials = buildMaterialLibrary();
  const collisionWorld = new CollisionWorld();

  const { group: rotundaGroup, statusLamp } = buildRotunda({ materials, collisionWorld });
  scene.add(rotundaGroup);

  ui.setLoadingProgress(0.6);
  const registry = buildRegistryWing({ materials, collisionWorld });
  scene.add(registry.group);

  const input = new InputManager(canvas);
  input.attach();

  // Language + brightness are loaded (and applied) before the first paint
  // of any real UI text, and before the start prompt shows its device-
  // specific control hint.
  if (input.isTouch) {
    document.getElementById('start-prompt__hint').dataset.i18nHtml = 'start.hint.touch';
  }
  const settingsStore = new SettingsStore();
  let settingsOpen = false;
  const settingsPanel = new SettingsPanel({
    settingsStore,
    onExposureChange: (value) => { renderer.toneMappingExposure = value; },
    onOpenChange: (isOpen) => {
      settingsOpen = isOpen;
      if (isOpen) {
        if (document.pointerLockElement === canvas) document.exitPointerLock();
      } else if (!input.isTouch && !input.isLocked) {
        ui.showStartPrompt();
      }
    },
  });
  settingsPanel.applyInitial();
  applyStaticTranslations();

  const audio = new AudioManager();

  const player = new PlayerController({
    camera,
    input,
    collisionWorld,
    onFootstep: () => audio.footstep(),
  });

  const interaction = new InteractionSystem({
    camera,
    onHoverChange: (target) => ui.setHovering(!!target),
  });
  interaction.register(rotundaGroup);
  interaction.register(registry.group);

  const caseOne = new CaseOneSystem({
    chair: registry.chair,
    hatch: registry.hatch,
    key: registry.key,
    corkboard: registry.corkboard,
    statusLamp,
    audio,
    ui,
    onStateChanged: () => save(),
  });

  const saveManager = new SaveManager();
  const isFreshSession = !saveManager.hasSave();
  const savedState = saveManager.load();
  player.setPose(savedState.player);
  player.update(0, { processInput: false }); // sync the camera before the first paint
  caseOne.hydrate(savedState.case001);
  ui.hydrateCasebook(savedState.casebook ?? []);
  if (savedState.case001?.solved && registry.hatch) {
    registry.hatch.rotation.x = -1.3;
  }

  function save() {
    saveManager.save({
      player: player.getPose(),
      case001: caseOne.serialize(),
      casebook: ui.getCasebookEntries(),
    });
  }

  function handleInteract() {
    if (ui.isCasebookOpen || settingsPanel.isOpen) return;
    const acted = interaction.interact();
    if (!acted) return;
    ui.pulseReticle('ok');
    save();
  }
  input.onInteract(handleInteract);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') {
      e.preventDefault();
      ui.toggleCasebook();
    } else if (e.code === 'Escape' && !input.isTouch) {
      e.preventDefault();
      if (settingsPanel.isOpen) settingsPanel.close();
      else settingsPanel.open();
    }
  });

  const introPan = new IntroPan();
  const introEligible = isFreshSession; // only the Rotunda is spacious enough for the establishing offset
  let introPlayed = false;

  function enterGame() {
    ui.hideStartPrompt();
    audio.unlock();
    if (input.isTouch) touchControls.show();
    if (introEligible && !introPlayed) {
      introPlayed = true;
      introPan.start(camera, player.position);
    }
  }

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      enterGame();
    } else if (!settingsPanel.isOpen) {
      ui.showStartPrompt();
    }
  });

  let touchControls = null;
  if (input.isTouch) {
    touchControls = new TouchControls({
      input,
      onInteract: handleInteract,
      onCasebookToggle: () => ui.toggleCasebook(),
    });

    // No real pointer lock on touch — tapping the start card is the entire
    // "begin" gesture, same job canvas's click-to-lock does on desktop.
    canvas.addEventListener(
      'touchstart',
      () => {
        if (input.isLocked) return;
        input.isLocked = true;
        enterGame();
      },
      { passive: true },
    );
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  ui.setLoadingProgress(1);
  ui.hideLoadingScreen();

  const clock = new THREE.Clock();
  let saveClock = 0;
  let elapsed = 0;
  const dustMotes = [...(rotundaGroup.userData.dustMotes ?? []), ...(registry.dustMotes ?? [])];

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.08);
    elapsed += dt;

    // Moves anything animated (the chair tween, the hatch, the key bob)
    // before the raycast below, and scene.updateMatrixWorld() then
    // refreshes every object's world transform from those new positions —
    // without it, interaction.update() would raycast against last frame's
    // transforms for anything that just moved, one frame behind reality.
    caseOne.update(dt);

    if (introPan.active) {
      input.consumeLookDelta(); // discard mouse movement gathered during the pan
      introPan.update(camera, dt);
    } else {
      // input.isLocked already goes false on desktop the moment settings
      // exits pointer lock; touch has no such signal, hence the explicit
      // settingsOpen check alongside it.
      const active = input.isLocked && !settingsOpen;
      player.update(dt, { processInput: active });
      if (active) {
        scene.updateMatrixWorld();
        interaction.update();
      }
    }
    audio.setZone(player.position.z > NORTH_WALL_Z ? 'hall' : 'room');

    updateFlicker(rotundaGroup, elapsed);
    updateFlicker(registry.group, elapsed);
    for (const dust of dustMotes) dust.userData.update(elapsed);

    saveClock += dt;
    if (saveClock > 4) {
      saveClock = 0;
      save();
    }

    if (!contextLost) renderer.render(scene, camera);
  }
  animate();

  if (import.meta.env.DEV) {
    window.__ARCHIVE__ = {
      scene, camera, player, caseOne, saveManager, collisionWorld, interaction, registry, introPan,
      settingsPanel, input, SPAWN_POSE,
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
