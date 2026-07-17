import { EVENTS } from '../core/Config.js';
import { puzzles } from '../data/index.js';

/**
 * PuzzleEngine.js
 * GDD §6. One puzzle type is implemented for this vertical slice — the
 * numeric "code" lock (mechanical lock archetype). Additional archetypes
 * (cipher, audio, layer, sequence, combination, pattern-recall) register
 * the same way: a type string, a matching UI overlay, and a
 * checkSolution() rule — no engine change required to add one.
 *
 * Design rule carried over from the GDD: wrong attempts are never
 * punished — checkSolution() is a pure comparison with no fail-state
 * side effects; the calling UI decides how to present "not yet."
 */
export class PuzzleEngine {
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  getPuzzle(puzzleId) {
    return puzzles.get(puzzleId) ?? null;
  }

  /** @param {object} puzzleDef @param {string} input */
  checkSolution(puzzleDef, input) {
    if (puzzleDef.type === 'code') return input === puzzleDef.solution;
    console.warn(`[PuzzleEngine] unknown puzzle type "${puzzleDef.type}"`);
    return false;
  }

  /** @param {object} puzzleDef @param {string} roomId */
  solve(puzzleDef, roomId) {
    this.#eventBus.emit(EVENTS.PUZZLE_SOLVED, { puzzleId: puzzleDef.id, roomId });
  }
}
