/**
 * ProgressTracker.js — SCAFFOLDING, filled in at Milestone 3 (GDD §12.5, §25).
 * The diegetic "Archive Index" ledger: per-chapter completion, Whispers,
 * Classified Files, and secret-room discovery — undiscovered entries show
 * a redacted silhouette + count only, never a spoiling title.
 */
export class ProgressTracker {
  constructor(eventBus, saveManager) {
    this.eventBus = eventBus;
    this.saveManager = saveManager;
  }

  open() {
    console.warn('[ProgressTracker] open() — no room/chapter content yet (Milestone 3+).');
  }
}
