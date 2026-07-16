import { DEFAULT_SAVE_STATE, EVENTS } from './Config.js';

/**
 * SessionStore.js
 * The single live, in-memory copy of the save-shaped state object while a
 * session is active. Every gameplay system (RoomSystem, InventorySystem,
 * PuzzleEngine, NotebookSystem, AchievementSystem, ...) only ever *emits*
 * events; SessionStore is the one place that turns those events into state
 * mutations and hands the result to SaveManager.autosave() — this keeps
 * "what gets persisted" in one auditable place instead of scattered across
 * every system that happens to know about SaveManager.
 */
export class SessionStore {
  #eventBus;
  #saveManager;
  #state = structuredClone(DEFAULT_SAVE_STATE);

  constructor(eventBus, saveManager) {
    this.#eventBus = eventBus;
    this.#saveManager = saveManager;
  }

  get state() {
    return this.#state;
  }

  /** Replaces the live state wholesale — called on New Archive (fresh) or Continue (loaded). */
  hydrate(state) {
    this.#state = structuredClone(state ?? DEFAULT_SAVE_STATE);
  }

  init() {
    this.#eventBus.on(EVENTS.ROOM_ENTERED, ({ roomId }) => {
      this.#state.currentRoomId = roomId;
      this.#persist();
    });

    this.#eventBus.on(EVENTS.ITEM_COLLECTED, ({ itemId }) => {
      if (!this.#state.inventory.includes(itemId)) this.#state.inventory.push(itemId);
      this.#persist();
    });

    this.#eventBus.on(EVENTS.PUZZLE_SOLVED, ({ puzzleId }) => {
      this.#state.flags[`puzzle_solved_${puzzleId}`] = true;
      this.#persist();
    });

    this.#eventBus.on(EVENTS.CLASSIFIED_FILE_FOUND, ({ fileId }) => {
      if (!this.#state.classifiedFilesFound.includes(fileId)) this.#state.classifiedFilesFound.push(fileId);
      this.#persist();
    });

    this.#eventBus.on(EVENTS.EASTER_EGG_TRIGGERED, ({ easterEggId }) => {
      if (!this.#state.easterEggsFound.includes(easterEggId)) this.#state.easterEggsFound.push(easterEggId);
      this.#persist();
    });

    this.#eventBus.on(EVENTS.ACHIEVEMENT_UNLOCKED, ({ id }) => {
      if (!this.#state.achievements.unlocked.includes(id)) this.#state.achievements.unlocked.push(id);
      this.#persist();
    });

    this.#eventBus.on(EVENTS.HINT_USED, () => {
      this.#state.stats.hintsUsed += 1;
      this.#persist();
    });

    this.#eventBus.on(EVENTS.NOTEBOOK_ENTRY_ADDED, ({ entryId }) => {
      if (!this.#state.notebook.includes(entryId)) this.#state.notebook.push(entryId);
      this.#persist();
    });

    this.#eventBus.on(EVENTS.FLAG_SET, ({ key, value }) => {
      this.#state.flags[key] = value;
      this.#persist();
    });

    this.#eventBus.on(EVENTS.TERMINAL_COMMAND_RUN, ({ terminalId, command }) => {
      const list = (this.#state.terminalsUnlockedCommands[terminalId] ??= []);
      if (!list.includes(command)) list.push(command);
      this.#persist();
    });
  }

  #persist() {
    this.#saveManager.autosave(this.#state);
  }

  /** Immediate, non-debounced write — used before leaving to the Main Menu. */
  flush() {
    this.#saveManager.flushAutosave(this.#state);
  }

  hasFlag(key) {
    return this.#state.flags[key] === true;
  }
}
