import * as THREE from 'three';
import { SaveManager } from './core/SaveManager.js';
import { AudioManager } from './core/AudioManager.js';
import { InputManager } from './core/InputManager.js';
import { buildMaterialLibrary } from './world/Materials.js';
import { CollisionWorld } from './world/CollisionWorld.js';
import { PlayerController } from './world/PlayerController.js';
import { buildRotunda } from './world/buildRotunda.js';
import { buildRegistryWing } from './world/buildRegistryWing.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { CaseOneSystem } from './systems/CaseOneSystem.js';
import { UIController } from './ui/UIController.js';
import { SPAWN_POSE, NORTH_WALL_Z } from './world/LevelLayout.js';
import { updateFlicker } from './world/Flicker.js';
import { IntroPan } from './world/IntroPan.js';

async function boot() {
  const ui = new UIController();
  ui.setLoadingProgress(0.1);

  const canvas = document.getElementById('scene-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

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

  input.onInteract(() => {
    if (ui.isCasebookOpen) return;
    const acted = interaction.interact();
    if (!acted) return;
    ui.pulseReticle('ok');
    save();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') {
      e.preventDefault();
      ui.toggleCasebook();
    }
  });

  const introPan = new IntroPan();
  let introEligible = isFreshSession; // only the Rotunda is spacious enough for the establishing offset
  let introPlayed = false;

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      ui.hideStartPrompt();
      audio.unlock();
      if (introEligible && !introPlayed) {
        introPlayed = true;
        introPan.start(camera, player.position);
      }
    } else {
      ui.showStartPrompt();
    }
  });

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

    if (introPan.active) {
      input.consumeLookDelta(); // discard mouse movement gathered during the pan
      introPan.update(camera, dt);
    } else {
      player.update(dt, { processInput: input.isLocked });
      if (input.isLocked) interaction.update();
    }
    caseOne.update(dt);
    audio.setZone(player.position.z > NORTH_WALL_Z ? 'hall' : 'room');

    updateFlicker(rotundaGroup, elapsed);
    updateFlicker(registry.group, elapsed);
    for (const dust of dustMotes) dust.userData.update(elapsed);

    saveClock += dt;
    if (saveClock > 4) {
      saveClock = 0;
      save();
    }

    renderer.render(scene, camera);
  }
  animate();

  if (import.meta.env.DEV) {
    window.__ARCHIVE__ = { scene, camera, player, caseOne, saveManager, collisionWorld, interaction, registry, introPan, SPAWN_POSE };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
