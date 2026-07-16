/**
 * Config.js
 * Single source of truth for constants shared across the codebase:
 * event names, storage keys, schema version, breakpoints, and defaults.
 * No other module should hardcode a string that appears here.
 */

/** localStorage key prefix. Real key = `${STORAGE_PREFIX}:${slot}`. */
export const STORAGE_PREFIX = 'archive001';

/** Bump whenever the save shape changes; SaveManager migrates old saves forward. */
export const SAVE_SCHEMA_VERSION = 2;

export const SAVE_SLOTS = Object.freeze({
  AUTOSAVE: 'autosave',
  CHECKPOINT_1: 'checkpoint_1',
  CHECKPOINT_2: 'checkpoint_2',
  CHECKPOINT_3: 'checkpoint_3',
});

/** Finite states owned exclusively by GameStateManager. See GDD §15. */
export const GAME_STATES = Object.freeze({
  BOOT: 'BOOT',
  LOADING: 'LOADING',
  MAIN_MENU: 'MAIN_MENU',
  SETTINGS: 'SETTINGS',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  CHAPTER_COMPLETE: 'CHAPTER_COMPLETE',
  CINEMATIC: 'CINEMATIC',
  ENDING: 'ENDING',
});

/**
 * Every event the codebase is allowed to emit, grouped by owning system.
 * Centralizing this catches typos at review time instead of at runtime.
 */
export const EVENTS = Object.freeze({
  // GameStateManager
  STATE_CHANGED: 'state:changed',

  // SaveManager
  SAVE_WRITTEN: 'save:written',
  SAVE_LOADED: 'save:loaded',
  SAVE_CORRUPTED: 'save:corrupted',
  SAVE_DELETED: 'save:deleted',

  // InputManager
  INPUT_POINTER_DOWN: 'input:pointerdown',
  INPUT_POINTER_UP: 'input:pointerup',
  INPUT_KEY_DOWN: 'input:keydown',
  INPUT_ACTION: 'input:action', // normalized semantic action, e.g. 'toggleLayer', 'pause'

  // AudioManager
  AUDIO_VOLUME_CHANGED: 'audio:volumeChanged',
  AUDIO_ROOM_STATE_CHANGED: 'audio:roomStateChanged', // §12.10 dynamic ambient mix

  // UI navigation (menus, overlays)
  UI_NAVIGATE: 'ui:navigate',
  UI_OVERLAY_OPENED: 'ui:overlayOpened',
  UI_OVERLAY_CLOSED: 'ui:overlayClosed',

  // Gameplay-facing events future systems will emit (M2+). Declared now so
  // AchievementSystem/StatsSystem/CinematicSystem can be wired as inert
  // listeners in M1 without churn when the emitting systems land later.
  PUZZLE_SOLVED: 'puzzle:solved',
  ROOM_ENTERED: 'room:entered',
  ITEM_COLLECTED: 'item:collected',
  WHISPER_FOUND: 'whisper:found',
  CLASSIFIED_FILE_FOUND: 'classifiedFile:found',
  SECRET_ROOM_ENTERED: 'secretRoom:entered',
  EASTER_EGG_TRIGGERED: 'easterEgg:triggered',
  CHAPTER_COMPLETED: 'chapter:completed',
  HINT_USED: 'hint:used',
  ENDING_REACHED: 'ending:reached',
  CINEMATIC_BEAT_REQUESTED: 'cinematic:beatRequested',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  FLAG_SET: 'flag:set',
  NOTEBOOK_ENTRY_ADDED: 'notebook:entryAdded',
  TERMINAL_COMMAND_RUN: 'terminal:commandRun',
});

/** Layout breakpoints in px, matching GDD §22. */
export const BREAKPOINTS = Object.freeze({
  MOBILE_MAX: 599,
  TABLET_MAX: 1023,
});

export const DEFAULT_SETTINGS = Object.freeze({
  audioMaster: 0.8,
  audioMusic: 0.8,
  audioSfx: 0.9,
  audioVoice: 1.0,
  subtitles: true,
  textScale: 1.0,
  language: 'en',
  layerAssist: false,
  reduceMotion: false,
  colorblindSafeMode: false,
  hintFrequency: 'normal', // 'normal' | 'reduced'
});

export const DEFAULT_SAVE_STATE = Object.freeze({
  schemaVersion: SAVE_SCHEMA_VERSION,
  currentRoomId: null,
  flags: {},
  inventory: [],
  notebook: [],
  whispersFound: [],
  classifiedFilesFound: [],
  secretRoomsFound: [],
  easterEggsFound: [],
  achievements: { unlocked: [], progress: {} },
  terminalsUnlockedCommands: {},
  stats: {
    playtimeSeconds: 0,
    chapterTimes: {},
    hintsUsed: 0,
    completionsLog: [],
  },
  hasCompletedOnce: false,
  hiddenEndingUnlocked: false,
  devCommentaryUnlocked: false,
  photoModeUnlocked: false,
  endingChosen: null,
  timestamp: null,
});
