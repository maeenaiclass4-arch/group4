/**
 * HintDrawer.js — SCAFFOLDING, filled in at Milestone 3 (GDD §6, §11, §25).
 * 3-tier hint drawer (nudge → clue → near-solution) for the puzzle
 * currently active in PuzzleEngine. Never forced, never shames the
 * player — hint usage is tracked by StatsSystem for flavor text only.
 */
export class HintDrawer {
  constructor(eventBus, puzzleEngine) {
    this.eventBus = eventBus;
    this.puzzleEngine = puzzleEngine;
  }

  open() {
    console.warn('[HintDrawer] open() — no puzzle content yet (Milestone 3+).');
  }
}
