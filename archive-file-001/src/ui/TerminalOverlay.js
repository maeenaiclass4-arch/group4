/**
 * TerminalOverlay.js — SCAFFOLDING, filled in at Milestone 2 (GDD §12.11, §25).
 * Retro-CRT interactive terminal UI (typed-out responses, blinking cursor,
 * scanline/grain reuse from the VFX layer) backed by TerminalSystem.
 */
export class TerminalOverlay {
  constructor(eventBus, terminalSystem) {
    this.eventBus = eventBus;
    this.terminalSystem = terminalSystem;
  }

  /** @param {string} terminalId */
  open(terminalId) {
    console.warn(`[TerminalOverlay] open("${terminalId}") — no terminal content yet (Milestone 2+).`);
  }
}
