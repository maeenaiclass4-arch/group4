/**
 * EndGameStats.js — SCAFFOLDING, filled in at Milestone 6 (GDD §12.6, §25).
 * The diegetic "Session Report" shown on any ending: playtime,
 * collectible totals, hints used, ending reached, and a personalized
 * flavor line — plus a comparison against stats.completionsLog[] on replay.
 */
export class EndGameStats {
  constructor(eventBus, saveManager, statsSystem) {
    this.eventBus = eventBus;
    this.saveManager = saveManager;
    this.statsSystem = statsSystem;
  }

  /** @param {string} endingId */
  show(endingId) {
    console.warn(`[EndGameStats] show("${endingId}") — no ending content yet (Milestone 6+).`);
  }
}
