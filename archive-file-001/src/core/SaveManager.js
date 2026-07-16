import {
  DEFAULT_SAVE_STATE,
  DEFAULT_SETTINGS,
  EVENTS,
  SAVE_SCHEMA_VERSION,
  SAVE_SLOTS,
  STORAGE_PREFIX,
} from './Config.js';

const SETTINGS_KEY = `${STORAGE_PREFIX}:settings`;

/**
 * SaveManager.js
 * Owns all persistence. Storage is behind a small interface (#read/#write)
 * so a future cloud-save adapter (GDD §24) can be swapped in without
 * touching any calling code — every other system only ever calls
 * load()/save()/listCheckpoints(), never localStorage directly.
 *
 * Resilience: a save that fails to parse is never discarded silently.
 * The broken blob is preserved under a `*:corrupt-backup` key and load()
 * falls back to DEFAULT_SAVE_STATE so the game can still boot.
 */
export class SaveManager {
  #eventBus;
  #autosaveTimer = null;
  #autosaveDelayMs = 800;

  /** @param {import('./EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  // ---- low-level storage interface (swap point for a future backend) ----

  #read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error(`[SaveManager] localStorage read failed for "${key}":`, error);
      return null;
    }
  }

  #write(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[SaveManager] localStorage write failed for "${key}":`, error);
      return false;
    }
  }

  #remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[SaveManager] localStorage remove failed for "${key}":`, error);
    }
  }

  #slotKey(slot) {
    return `${STORAGE_PREFIX}:${slot}`;
  }

  // ---- migration ----

  /**
   * Fills in any field missing from an older save with its default, and
   * bumps schemaVersion. Never throws — a save from an earlier schema
   * version should always keep working after this runs.
   * @param {object} raw
   */
  #migrate(raw) {
    const migrated = { ...DEFAULT_SAVE_STATE, ...raw };
    migrated.flags = { ...DEFAULT_SAVE_STATE.flags, ...(raw.flags ?? {}) };
    migrated.achievements = {
      unlocked: raw.achievements?.unlocked ?? [],
      progress: raw.achievements?.progress ?? {},
    };
    migrated.stats = { ...DEFAULT_SAVE_STATE.stats, ...(raw.stats ?? {}) };
    migrated.terminalsUnlockedCommands = raw.terminalsUnlockedCommands ?? {};
    migrated.schemaVersion = SAVE_SCHEMA_VERSION;
    return migrated;
  }

  // ---- save-state slots (autosave + 3 checkpoints) ----

  /**
   * @param {string} slot one of SAVE_SLOTS
   * @returns {object|null} the parsed, migrated save state, or null if the slot is empty
   */
  load(slot = SAVE_SLOTS.AUTOSAVE) {
    const raw = this.#read(this.#slotKey(slot));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const state = this.#migrate(parsed);
      this.#eventBus.emit(EVENTS.SAVE_LOADED, { slot, state });
      return state;
    } catch (error) {
      console.error(`[SaveManager] corrupted save in slot "${slot}":`, error);
      this.#write(`${this.#slotKey(slot)}:corrupt-backup`, raw);
      this.#eventBus.emit(EVENTS.SAVE_CORRUPTED, { slot, error: String(error) });
      return null;
    }
  }

  /**
   * Writes state to a slot immediately (used for manual checkpoints and
   * the final autosave-on-transition write).
   * @param {string} slot
   * @param {object} state
   */
  save(slot, state) {
    const payload = { ...state, schemaVersion: SAVE_SCHEMA_VERSION, timestamp: Date.now() };
    const ok = this.#write(this.#slotKey(slot), JSON.stringify(payload));
    if (ok) this.#eventBus.emit(EVENTS.SAVE_WRITTEN, { slot, state: payload });
    return ok;
  }

  /**
   * Debounced autosave — call on every mutation event; only the last call
   * within #autosaveDelayMs actually hits localStorage, so a burst of
   * pickups/flags during one interaction doesn't thrash disk I/O.
   * @param {object} state
   */
  autosave(state) {
    clearTimeout(this.#autosaveTimer);
    this.#autosaveTimer = setTimeout(() => {
      this.save(SAVE_SLOTS.AUTOSAVE, state);
    }, this.#autosaveDelayMs);
  }

  /** Cancels any pending debounced autosave and flushes it immediately, if present. */
  flushAutosave(state) {
    clearTimeout(this.#autosaveTimer);
    this.save(SAVE_SLOTS.AUTOSAVE, state);
  }

  delete(slot) {
    this.#remove(this.#slotKey(slot));
    this.#eventBus.emit(EVENTS.SAVE_DELETED, { slot });
  }

  hasSave(slot = SAVE_SLOTS.AUTOSAVE) {
    return this.#read(this.#slotKey(slot)) !== null;
  }

  /**
   * Metadata for the 3 manual checkpoint slots, for a checkpoint-picker UI —
   * intentionally returns light metadata, not full state, so listing slots
   * never requires parsing every blob.
   */
  listCheckpoints() {
    return [SAVE_SLOTS.CHECKPOINT_1, SAVE_SLOTS.CHECKPOINT_2, SAVE_SLOTS.CHECKPOINT_3].map(
      (slot) => {
        const state = this.load(slot);
        return state
          ? { slot, empty: false, currentRoomId: state.currentRoomId, timestamp: state.timestamp }
          : { slot, empty: true };
      },
    );
  }

  // ---- settings (global, independent of save slot) ----

  loadSettings() {
    const raw = this.#read(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
      console.error('[SaveManager] corrupted settings, falling back to defaults:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(settings) {
    this.#write(SETTINGS_KEY, JSON.stringify(settings));
  }
}
