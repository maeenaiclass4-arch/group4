/**
 * ChapterCompleteScreen.js — SCAFFOLDING, filled in at Milestone 3 (GDD §12.5, §25).
 * Full-screen diegetic interstitial shown after a chapter's final puzzle:
 * title card, "restored memory" thumbnail collage, and that chapter's
 * stats (time, Whispers, hints) before the transition to the next chapter.
 */
export class ChapterCompleteScreen {
  constructor(eventBus, statsSystem) {
    this.eventBus = eventBus;
    this.statsSystem = statsSystem;
  }

  /** @param {string} chapterId */
  show(chapterId) {
    console.warn(`[ChapterCompleteScreen] show("${chapterId}") — no chapter content yet (Milestone 3+).`);
  }
}
