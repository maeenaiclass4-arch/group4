import { EVENTS } from '../core/Config.js';
import { terminals } from '../data/index.js';

/**
 * TerminalSystem.js
 * GDD §12.11. Parses a typed command against a terminal's data-driven
 * command set. Returns a string *key* (not display text) so the UI layer
 * stays the only thing that knows about i18n — this class is pure logic.
 */
export class TerminalSystem {
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  loadTerminal(terminalId) {
    const def = terminals.get(terminalId);
    if (!def) console.error(`[TerminalSystem] unknown terminal "${terminalId}"`);
    return def ?? null;
  }

  /**
   * @param {object} def terminal definition
   * @param {string} rawInput
   * @returns {string|null} a string key to display, or null for empty input
   */
  runCommand(def, rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return null;

    const [word, ...rest] = trimmed.split(/\s+/);
    const command = word.toUpperCase();
    this.#eventBus.emit(EVENTS.TERMINAL_COMMAND_RUN, { terminalId: def.id, command });

    if (command === 'SEARCH') {
      const term = rest.join(' ').toLowerCase();
      const match = def.searchTerms?.[term];
      if (match) {
        if (match.easterEggId) {
          this.#eventBus.emit(EVENTS.EASTER_EGG_TRIGGERED, { easterEggId: match.easterEggId });
        }
        return match.responseKey;
      }
      return def.searchDefaultKey;
    }

    const known = def.commands?.[command];
    if (!known) return def.unknownKey;

    if (known.onRun?.addNotebookEntry) {
      this.#eventBus.emit(EVENTS.NOTEBOOK_ENTRY_ADDED, { entryId: known.onRun.addNotebookEntry });
    }
    return known.responseKey;
  }
}
