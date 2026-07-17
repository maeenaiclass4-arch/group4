import { EVENTS } from '../core/Config.js';
import { terminals } from '../data/index.js';

/**
 * TerminalSystem.js
 * GDD §12.11. The terminal is a pure story/flavor surface — it is never
 * required to progress (the puzzle's clue lives on the evidence board,
 * GDD Priority 3 revision). Players select a pre-defined "record" to
 * display rather than typing a command, so there is nothing to guess or
 * spell correctly. Returns a string *key* (not display text) so the UI
 * layer stays the only thing that knows about i18n — this class is pure logic.
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
   * @param {string} recordId
   * @returns {string|null} a string key to display, or null if the record doesn't exist
   */
  runRecord(def, recordId) {
    const record = def.records?.find((r) => r.id === recordId);
    if (!record) return null;

    this.#eventBus.emit(EVENTS.TERMINAL_COMMAND_RUN, { terminalId: def.id, command: recordId });
    if (record.easterEggId) {
      this.#eventBus.emit(EVENTS.EASTER_EGG_TRIGGERED, { easterEggId: record.easterEggId });
    }
    if (record.onRun?.addNotebookEntry) {
      this.#eventBus.emit(EVENTS.NOTEBOOK_ENTRY_ADDED, { entryId: record.onRun.addNotebookEntry });
    }
    return record.responseKey;
  }
}
