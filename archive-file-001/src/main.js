import { EVENTS, GAME_STATES, SAVE_SLOTS } from './core/Config.js';
import { EventBus } from './core/EventBus.js';
import { GameStateManager } from './core/GameStateManager.js';
import { SaveManager } from './core/SaveManager.js';
import { SessionStore } from './core/SessionStore.js';
import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';
import { setLanguage } from './core/i18n.js';

import { RoomSystem } from './systems/RoomSystem.js';
import { HotspotSystem } from './systems/HotspotSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { PuzzleEngine } from './systems/PuzzleEngine.js';
import { NotebookSystem } from './systems/NotebookSystem.js';
import { LayerToggleSystem } from './systems/LayerToggleSystem.js';
import { AchievementSystem } from './systems/AchievementSystem.js';
import { StatsSystem } from './systems/StatsSystem.js';
import { TerminalSystem } from './systems/TerminalSystem.js';
import { CinematicSystem } from './systems/CinematicSystem.js';

import { LoadingScreen } from './ui/LoadingScreen.js';
import { MainMenu } from './ui/MainMenu.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { RoomView } from './ui/RoomView.js';
import { InventoryDock } from './ui/InventoryDock.js';
import { PuzzleOverlay } from './ui/PuzzleOverlay.js';
import { TerminalOverlay } from './ui/TerminalOverlay.js';
import { ReaderOverlay } from './ui/ReaderOverlay.js';
import { IntroSequence } from './ui/IntroSequence.js';
import { ConfirmModal } from './ui/ConfirmModal.js';
import { CheckpointsPanel } from './ui/CheckpointsPanel.js';
import { AchievementToast } from './ui/AchievementToast.js';

import { achievements as achievementDefs } from './data/index.js';

/**
 * main.js — composition root (GDD §15).
 *
 * This is the only file allowed to `new` every system and wire them
 * together; everything downstream talks through the shared EventBus.
 * Milestone 2 adds a live gameplay loop on top of Milestone 1's shell:
 * SessionStore is the live save-state, RoomView is the one place a room
 * gets drawn, and terminal/puzzle/reader/cinematic are exclusive overlays
 * layered on top of the PLAYING screen (never more than one open at once).
 */

function byId(id) {
  return document.getElementById(id);
}

function boot() {
  const eventBus = new EventBus();
  const saveManager = new SaveManager(eventBus);
  const sessionStore = new SessionStore(eventBus, saveManager);
  const gameStateManager = new GameStateManager(eventBus);
  const audioManager = new AudioManager(eventBus);
  const inputManager = new InputManager(eventBus);
  sessionStore.init();

  // Unlock the Web Audio graph on the first real user gesture (browser autoplay policy).
  eventBus.once(EVENTS.INPUT_POINTER_DOWN, () => audioManager.unlock());
  eventBus.once(EVENTS.INPUT_KEY_DOWN, () => audioManager.unlock());
  inputManager.attach();

  // ---- gameplay systems ----
  const roomSystem = new RoomSystem(eventBus);
  const hotspotSystem = new HotspotSystem();
  const inventorySystem = new InventorySystem(eventBus);
  const puzzleEngine = new PuzzleEngine(eventBus);
  const notebookSystem = new NotebookSystem(eventBus);
  const layerToggleSystem = new LayerToggleSystem(eventBus);
  const terminalSystem = new TerminalSystem(eventBus);
  const cinematicSystem = new CinematicSystem(eventBus);
  const statsSystem = new StatsSystem(eventBus);
  const achievementSystem = new AchievementSystem(eventBus, achievementDefs, []);
  cinematicSystem.init();
  achievementSystem.init();
  cinematicSystem.mount(byId('layer-cinematic'));

  // ---- shared / menu UI ----
  const confirmModal = new ConfirmModal();
  confirmModal.mount(byId('overlay-confirm'));

  const checkpointsPanel = new CheckpointsPanel(eventBus, saveManager, gameStateManager);
  checkpointsPanel.mount(byId('overlay-checkpoints'));

  const settingsPanel = new SettingsPanel(eventBus, gameStateManager, saveManager, audioManager);
  // Apply persisted language/accessibility/audio settings before the first paint of any screen.
  setLanguage(settingsPanel.settings.language);
  audioManager.applyVolumes(settingsPanel.settings);
  document.documentElement.dataset.reduceMotion = String(settingsPanel.settings.reduceMotion);
  document.documentElement.dataset.layerAssist = String(settingsPanel.settings.layerAssist);
  settingsPanel.mount(byId('overlay-settings'));

  const achievementToast = new AchievementToast();
  achievementToast.mount(byId('toast-region'));
  achievementToast.init(eventBus);

  const loadingScreen = new LoadingScreen(eventBus, gameStateManager);
  loadingScreen.waitFor(document.fonts?.ready ?? Promise.resolve());

  const mainMenu = new MainMenu(eventBus, gameStateManager, saveManager, confirmModal, checkpointsPanel);
  const pauseMenu = new PauseMenu(eventBus, gameStateManager, saveManager, checkpointsPanel);
  const introSequence = new IntroSequence();
  introSequence.mount(byId('layer-intro'));

  // ---- room / gameplay UI ----
  const inventoryDock = new InventoryDock(eventBus, inventorySystem);
  inventoryDock.mount(byId('inventory-dock-region'));

  const puzzleOverlay = new PuzzleOverlay(eventBus, puzzleEngine);
  puzzleOverlay.mount(byId('overlay-puzzle'));

  const terminalOverlay = new TerminalOverlay(terminalSystem);
  terminalOverlay.mount(byId('overlay-terminal'));

  const readerOverlay = new ReaderOverlay();
  readerOverlay.mount(byId('overlay-reader'));

  function closeRoomOverlays() {
    terminalOverlay.close();
    puzzleOverlay.close();
    readerOverlay.close();
  }

  function anyRoomOverlayOpen() {
    return !byId('overlay-terminal').hidden || !byId('overlay-puzzle').hidden || !byId('overlay-reader').hidden;
  }

  const roomView = new RoomView({
    eventBus,
    gameStateManager,
    roomSystem,
    hotspotSystem,
    layerToggleSystem,
    inventorySystem,
    inventoryDock,
    puzzleEngine,
    puzzleOverlay,
    terminalOverlay,
    readerOverlay,
    cinematicSystem,
    sessionStore,
    closeRoomOverlays,
  });
  roomView.mount();

  /**
   * Loads (or starts) an in-game session. Only runs when meta explicitly
   * signals intent — a plain "Resume" from the Pause Menu carries no meta
   * and correctly leaves the current room untouched.
   */
  async function enterPlaying(meta) {
    const state = meta.fromCheckpoint ? saveManager.load(meta.fromCheckpoint) : saveManager.load(SAVE_SLOTS.AUTOSAVE);
    sessionStore.hydrate(state);
    inventorySystem.hydrate(sessionStore.state.inventory);
    inventoryDock.render();

    if (meta.fresh) await introSequence.play();

    roomSystem.loadRoom(sessionStore.state.currentRoomId ?? 'prologue_entrance');
  }

  // ---- screen / overlay orchestration ----
  const screens = {
    [GAME_STATES.LOADING]: byId('screen-loading'),
    [GAME_STATES.MAIN_MENU]: byId('screen-main-menu'),
    [GAME_STATES.PLAYING]: byId('screen-room'),
  };
  const overlaySettings = byId('overlay-settings');
  const overlayPause = byId('overlay-pause');
  let pauseMounted = false;

  eventBus.on(EVENTS.STATE_CHANGED, ({ nextState, meta }) => {
    if (nextState in screens) {
      for (const [state, node] of Object.entries(screens)) {
        node.hidden = state !== nextState;
      }
    }

    // Re-rendered on every visit so "Continue" always reflects the latest save (GDD §11).
    if (nextState === GAME_STATES.MAIN_MENU) {
      mainMenu.mount(byId('screen-main-menu'));
      closeRoomOverlays();
    }
    if (nextState === GAME_STATES.PLAYING && (meta.fresh || meta.resumed || meta.fromCheckpoint)) {
      enterPlaying(meta);
    }

    overlaySettings.hidden = nextState !== GAME_STATES.SETTINGS;
    overlayPause.hidden = nextState !== GAME_STATES.PAUSED;
    if (nextState === GAME_STATES.SETTINGS) settingsPanel.mount(overlaySettings);
    if (nextState === GAME_STATES.PAUSED) {
      closeRoomOverlays();
      if (!pauseMounted) {
        pauseMenu.mount(overlayPause);
        pauseMounted = true;
      }
    }
  });

  // Language can change mid-session (Settings, GDD §14/§20 RTL support).
  // i18n.setLanguage() already flipped document dir/lang; this re-renders
  // every other currently-mounted piece of UI so the switch is visible
  // immediately everywhere, not just the next time each screen opens.
  // SettingsPanel re-renders itself already, inside its own #commit().
  eventBus.on(EVENTS.LANGUAGE_CHANGED, () => {
    if (gameStateManager.state === GAME_STATES.MAIN_MENU) {
      mainMenu.mount(byId('screen-main-menu'));
    }
    if (pauseMounted) pauseMenu.mount(overlayPause);
    inventoryDock.render();
  });

  // Global semantic-action handling (GDD §12): Esc closes the topmost open
  // surface first, then falls back to pause; Space toggles the Memory Layer.
  eventBus.on(EVENTS.INPUT_ACTION, ({ action }) => {
    if (action === 'toggleLayer' && gameStateManager.state === GAME_STATES.PLAYING && !anyRoomOverlayOpen()) {
      layerToggleSystem.toggle();
      return;
    }
    if (action !== 'back') return;
    switch (gameStateManager.state) {
      case GAME_STATES.PLAYING:
        if (anyRoomOverlayOpen()) closeRoomOverlays();
        else gameStateManager.transition(GAME_STATES.PAUSED);
        break;
      case GAME_STATES.PAUSED:
        gameStateManager.transition(GAME_STATES.PLAYING);
        break;
      case GAME_STATES.SETTINGS:
        gameStateManager.closeSettings();
        break;
      default:
        break;
    }
  });

  // ---- polish: synthesized UI feedback (GDD Priority 7 — no audio assets
  // exist yet, so these are short Web Audio tones, not recordings) ----
  document.addEventListener('click', (event) => {
    if (event.target.closest('button, .room-hotspot')) audioManager.playSfx('click');
  });
  eventBus.on(EVENTS.PUZZLE_SOLVED, () => audioManager.playSfx('success'));
  eventBus.on(EVENTS.PUZZLE_FAILED, () => audioManager.playSfx('deny'));
  eventBus.on(EVENTS.ACTION_DENIED, () => audioManager.playSfx('deny'));
  eventBus.on(EVENTS.ITEM_COLLECTED, () => audioManager.playSfx('pickup'));
  eventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, () => audioManager.playSfx('achievement'));
  eventBus.on(EVENTS.LAYER_CHANGED, () => audioManager.playSfx('layer'));
  eventBus.on(EVENTS.ROOM_ENTERED, () => audioManager.playSfx('door'));

  loadingScreen.mount(byId('screen-loading'));
  gameStateManager.transition(GAME_STATES.LOADING);

  if (import.meta.env.DEV) {
    // Console-only inspection hook for development; never referenced by game logic.
    window.__ARCHIVE__ = {
      eventBus,
      gameStateManager,
      saveManager,
      sessionStore,
      audioManager,
      roomSystem,
      hotspotSystem,
      inventorySystem,
      puzzleEngine,
      notebookSystem,
      layerToggleSystem,
      terminalSystem,
      cinematicSystem,
      statsSystem,
      achievementSystem,
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
