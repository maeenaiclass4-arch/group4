import { EVENTS } from '../core/Config.js';

/**
 * StatsSystem.js — SCAFFOLDING, extended with full tracking at Milestone 2+ (GDD §12.6, §25).
 *
 * Intended responsibilities:
 *  - Aggregate playtime (overall + per-chapter), hint usage, and
 *    collectible counts for the Chapter Completion Screen (§12.5) and the
 *    End-Game Statistics "Session Report" (§12.6).
 *  - Purely a listener, same one-way-dependency rule as AchievementSystem.
 *
 * Session playtime tracking is real (not a stub) since it needs no
 * gameplay content to be meaningful — it starts counting the moment
 * GameStateManager enters PLAYING.
 */
export class StatsSystem {
  #eventBus;
  #playtimeSeconds;
  #tickHandle = null;

  /**
   * @param {import('../core/EventBus.js').EventBus} eventBus
   * @param {number} [initialPlaytimeSeconds] from save.stats.playtimeSeconds
   */
  constructor(eventBus, initialPlaytimeSeconds = 0) {
    this.#eventBus = eventBus;
    this.#playtimeSeconds = initialPlaytimeSeconds;
  }

  get playtimeSeconds() {
    return this.#playtimeSeconds;
  }

  startTracking() {
    if (this.#tickHandle) return;
    this.#tickHandle = setInterval(() => {
      this.#playtimeSeconds += 1;
    }, 1000);
  }

  stopTracking() {
    clearInterval(this.#tickHandle);
    this.#tickHandle = null;
  }
}
