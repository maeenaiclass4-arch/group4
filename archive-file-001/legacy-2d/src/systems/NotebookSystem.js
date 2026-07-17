/**
 * NotebookSystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §25).
 *
 * Intended responsibilities (GDD §5):
 *  - Auto-populate a player-readable log of codes/sketches/clues whenever
 *    a relevant puzzle or document event fires — the player should never
 *    need to keep notes outside the game.
 *  - Persisted verbatim into save.notebook (array of entry ids).
 */
export class NotebookSystem {
  #entries = [];
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get entries() {
    return [...this.#entries];
  }

  /** @param {string} entryId */
  addEntry(entryId) {
    console.warn(`[NotebookSystem] addEntry("${entryId}") — no notebook content yet (Milestone 2+).`);
  }

  hydrate(entryIds = []) {
    this.#entries = [...entryIds];
  }
}
