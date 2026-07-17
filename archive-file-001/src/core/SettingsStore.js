const SETTINGS_KEY = 'archive_file001_settings_v1';

const DEFAULT_SETTINGS = {
  language: 'en',
  exposure: 1.35, // matches main.js's renderer default
};

/**
 * Player preferences (language, brightness) — separate from SaveManager's
 * game-progress save, since these aren't part of "the case," they're part
 * of how the player wants the game presented on their specific device.
 */
export class SettingsStore {
  load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  save(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable — session continues without persistence.
    }
  }
}
