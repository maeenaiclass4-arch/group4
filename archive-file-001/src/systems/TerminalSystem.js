/**
 * TerminalSystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §12.11, §25).
 *
 * Intended responsibilities:
 *  - Load a terminal instance's command set from data/terminals/<id>.json.
 *  - Drive the typed-out (not instant) response renderer used by
 *    TerminalOverlay, including the fixed HELP/LOG/STATUS/SEARCH commands
 *    plus room-specific unlocked commands.
 *  - Serve as the entry interface for cipher/code puzzles that are
 *    "typed in" rather than dialed, and as the Easter-egg surface for
 *    hidden SEARCH terms.
 */
export class TerminalSystem {
  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  /** @param {string} terminalId */
  async loadTerminal(terminalId) {
    console.warn(`[TerminalSystem] loadTerminal("${terminalId}") — no terminal content yet (Milestone 2+).`);
  }
}
