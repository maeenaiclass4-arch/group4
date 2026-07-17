/**
 * Codex.js — SCAFFOLDING, filled in at Milestone 3 (GDD §7, §11, §12.2, §25).
 * The "Archive Index" collection screen: recovered documents, audio logs,
 * Whispers, and redacted-until-unlocked Classified File covers (§12.2).
 * Unlocked from the Main Menu after the Prologue; until then the Main
 * Menu shows it as a locked nav item (see MainMenu.js).
 */
export class Codex {
  constructor(eventBus, saveManager) {
    this.eventBus = eventBus;
    this.saveManager = saveManager;
  }

  open() {
    console.warn('[Codex] open() — no collectible content yet (Milestone 3+).');
  }
}
