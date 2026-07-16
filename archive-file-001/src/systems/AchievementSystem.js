import { EVENTS } from '../core/Config.js';

/**
 * AchievementSystem.js — SCAFFOLDING, wired for real content at Milestone 2 (GDD §12.1, §25).
 *
 * Design constraint carried over from the GDD: this system only ever
 * *listens*. It subscribes to the gameplay events below and cross-references
 * data/achievements.json (currently empty — no content has been authored
 * yet) — no other system ever calls into AchievementSystem directly, and
 * AchievementSystem never calls into anything but EventBus.emit(). That
 * one-way dependency is what lets new Commendations be added later as pure
 * data without touching puzzle/room/inventory code.
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
    if (this.#definitions.length === 0) return; // no Commendations authored yet
    console.info(`[AchievementSystem] observed "${eventName}"`, payload);
    // Milestone 2+: match payload against data/achievements.json condition
    // rules, and on a match: this.#unlocked.add(id);
    // this.#eventBus.emit(EVENTS.ACHIEVEMENT_UNLOCKED, { id });
  }

  get unlockedIds() {
    return [...this.#unlocked];
  }
}
