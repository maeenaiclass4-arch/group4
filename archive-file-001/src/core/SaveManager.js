const SAVE_KEY = 'archive_file001_save_v1';

const DEFAULT_STATE = {
  player: { x: 0, y: 1.68, z: 7.9, yaw: 0, pitch: 0 },
  case001: { chairSlot: 0, solved: false },
};

export class SaveManager {
  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(DEFAULT_STATE), ...parsed };
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private browsing, quota) — session continues without persistence.
    }
  }

  clear() {
    localStorage.removeItem(SAVE_KEY);
  }
}
