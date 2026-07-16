/**
 * ReaderOverlay.js — SCAFFOLDING, filled in at Milestone 2 (GDD §5, §21).
 * Full-screen diegetic document reader: paper "unfolds" on desktop, slides
 * up as a sheet on mobile. Reused for Whispers, Classified Files (§12.2),
 * and Developer Commentary text (§12.12) — one component, many content types.
 */
export class ReaderOverlay {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  /** @param {string} documentId */
  open(documentId) {
    console.warn(`[ReaderOverlay] open("${documentId}") — no document content yet (Milestone 2+).`);
  }
}
