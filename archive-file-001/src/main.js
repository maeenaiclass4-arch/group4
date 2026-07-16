import { EVENTS, GAME_STATES } from './core/Config.js';
import { EventBus } from './core/EventBus.js';
import { GameStateManager } from './core/GameStateManager.js';
import { SaveManager } from './core/SaveManager.js';
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
import { PlaceholderRoomView } from './ui/PlaceholderRoomView.js';
import { ConfirmModal } from './ui/ConfirmModal.js';
import { CheckpointsPanel } from './ui/CheckpointsPanel.js';
import { AchievementToast } from './ui/AchievementToast.js';

import achievementDefs from './data/achievements.json';

/**
 * main.js — composition root (GDD §15).
 *
 * This is the only file allowed to `new` every system and wire them
 * together; everything downstream talks through the shared EventBus. The
 * ordering below matters: Config-independent singletons first (EventBus,
 * SaveManager), then GameStateManager (needs EventBus), then everything
 * else. Milestone-2+ systems (Room/Puzzle/Inventory/...) are instantiated
 * here already — inert scaffolding today, real the moment their content
 * exists — so this file's shape doesn't change again at the next milestone.
 */

function byId(id) {
  return document.getElementById(id);
}

function boot() {
  setLanguage('en');

  const eventBus = new EventBus();
  const saveManager = new SaveManager(eventBus);
  const gameStateManager = new GameStateManager(eventBus);
  const audioManager = new AudioManager(eventBus);
  const inputManager = new InputManager(eventBus);

  // Unlock the Web Audio graph on the first real user gesture (browser autoplay policy).
  eventBus.once(EVENTS.INPUT_POINTER_DOWN, () => audioManager.unlock());
  eventBus.once(EVENTS.INPUT_KEY_DOWN, () => audioManager.unlock());
  inputManager.attach();

  // ---- Milestone 2+ systems: instantiated now, inert until content lands ----
  const roomSystem = new RoomSystem(eventBus);
  const hotspotSystem = new HotspotSystem(eventBus);
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

  // ---- UI ----
  const confirmModal = new ConfirmModal();
  confirmModal.mount(byId('overlay-confirm'));

  const checkpointsPanel = new CheckpointsPanel(eventBus, saveManager, gameStateManager);
  checkpointsPanel.mount(byId('overlay-checkpoints'));

  const settingsPanel = new SettingsPanel(eventBus, gameStateManager, saveManager, audioManager);
  // Apply persisted accessibility/audio settings before the first paint of any screen.
  audioManager.applyVolumes(settingsPanel.settings);
  document.documentElement.dataset.reduceMotion = String(settingsPanel.settings.reduceMotion);
  settingsPanel.mount(byId('overlay-settings'));

  const achievementToast = new AchievementToast();
  achievementToast.mount(byId('toast-region'));
  achievementToast.init(eventBus);

  const loadingScreen = new LoadingScreen(eventBus, gameStateManager);
  loadingScreen.waitFor(document.fonts?.ready ?? Promise.resolve());

  const mainMenu = new MainMenu(eventBus, gameStateManager, saveManager, confirmModal, checkpointsPanel);
  const pauseMenu = new PauseMenu(eventBus, gameStateManager, saveManager, checkpointsPanel);
  const placeholderRoomView = new PlaceholderRoomView(gameStateManager);

  const screens = {
    [GAME_STATES.LOADING]: byId('screen-loading'),
    [GAME_STATES.MAIN_MENU]: byId('screen-main-menu'),
    [GAME_STATES.PLAYING]: byId('screen-room-placeholder'),
  };
  const overlaySettings = byId('overlay-settings');
  const overlayPause = byId('overlay-pause');

  let roomMounted = false;
  let pauseMounted = false;

  eventBus.on(EVENTS.STATE_CHANGED, ({ nextState }) => {
    if (nextState in screens) {
      for (const [state, node] of Object.entries(screens)) {
        node.hidden = state !== nextState;
      }
    }

    // Re-rendered on every visit so "Continue" always reflects the latest save (GDD §11).
    if (nextState === GAME_STATES.MAIN_MENU) {
      mainMenu.mount(byId('screen-main-menu'));
    }
    if (nextState === GAME_STATES.PLAYING && !roomMounted) {
      placeholderRoomView.mount(byId('screen-room-placeholder'));
      roomMounted = true;
    }

    overlaySettings.hidden = nextState !== GAME_STATES.SETTINGS;
    overlayPause.hidden = nextState !== GAME_STATES.PAUSED;
    if (nextState === GAME_STATES.SETTINGS) settingsPanel.mount(overlaySettings);
    if (nextState === GAME_STATES.PAUSED && !pauseMounted) {
      pauseMenu.mount(overlayPause);
      pauseMounted = true;
    }
  });

  // Global "back" gesture (Esc on desktop, "×" affordance on mobile — GDD §12).
  eventBus.on(EVENTS.INPUT_ACTION, ({ action }) => {
    if (action !== 'back') return;
    switch (gameStateManager.state) {
      case GAME_STATES.PLAYING:
        gameStateManager.transition(GAME_STATES.PAUSED);
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

  loadingScreen.mount(byId('screen-loading'));
  gameStateManager.transition(GAME_STATES.LOADING);

  if (import.meta.env.DEV) {
    // Console-only inspection hook for development; never referenced by game logic.
    window.__ARCHIVE__ = {
      eventBus,
      gameStateManager,
      saveManager,
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
