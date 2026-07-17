import { EVENTS } from '../core/Config.js';
import { t } from '../core/i18n.js';

/**
 * AchievementSystem.js
 * GDD §12.1 — "Commendations." Strictly one-way: this class only ever
 * *listens* to gameplay events and cross-references data/achievements.json
 * condition rules; nothing else ever calls into it. That's what lets new
 * Commendations be added later as pure data, with zero changes to
 * whatever system emits the event they key off of.
 */
const WATCHED_EVENTS = [
  EVENTS.PUZZLE_SOLVED,
  EVENTS.WHISPER_FOUND,
  EVENTS.CLASSIFIED_FILE_FOUND,
  EVENTS.SECRET_ROOM_ENTERED,
  EVENTS.EASTER_EGG_TRIGGERED,
  EVENTS.CHAPTER_COMPLETED,
  EVENTS.HINT_USED,
  EVENTS.ENDING_REACHED,
];

export class AchievementSystem {
  #eventBus;
  #definitions;
  #unlocked;

  /**
   * @param {import('../core/EventBus.js').EventBus} eventBus
   * @param {object[]} [definitions] loaded from data/achievements.json
   * @param {string[]} [unlockedIds] from save.achievements.unlocked
   */
  constructor(eventBus, definitions = [], unlockedIds = []) {
    this.#eventBus = eventBus;
    this.#definitions = definitions;
    this.#unlocked = new Set(unlockedIds);
  }

  init() {
    for (const eventName of WATCHED_EVENTS) {
      this.#eventBus.on(eventName, (payload) => this.#evaluate(eventName, payload));
    }
  }

  #evaluate(eventName, payload) {
    for (const def of this.#definitions) {
      if (def.eventName !== eventName || this.#unlocked.has(def.id)) continue;
      if (this.#matches(def.match, payload)) {
        this.#unlocked.add(def.id);
        this.#eventBus.emit(EVENTS.ACHIEVEMENT_UNLOCKED, { id: def.id, title: t(def.titleKey) });
      }
    }
  }

  #matches(match, payload) {
    if (!match) return true;
    return Object.entries(match).every(([key, value]) => payload?.[key] === value);
  }

  get unlockedIds() {
    return [...this.#unlocked];
  }
}
