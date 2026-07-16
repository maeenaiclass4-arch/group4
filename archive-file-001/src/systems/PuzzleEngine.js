/**
 * PuzzleEngine.js — SCAFFOLDING, filled in at Milestone 2 (GDD §25).
 *
 * Intended responsibilities (GDD §6, §15):
 *  - Registry of puzzle-type classes (CipherPuzzle, LockPuzzle,
 *    SequencePuzzle, ObservationPuzzle, AudioPuzzle, LayerPuzzle,
 *    CombinationPuzzle, PatternRecallPuzzle) — one class per archetype,
 *    instantiated from room JSON (`type: "cipher"`), never one-off
 *    per-room scripts.
 *  - Each puzzle type implements: render(container), checkSolution(input),
 *    serialize()/deserialize() — the contract every future puzzle type
 *    must satisfy to plug into this engine.
 *  - Emits EVENTS.PUZZLE_SOLVED on success; never punishes a wrong
 *    attempt beyond a neutral "not yet" cue (GDD §6 design rules).
 */
export class PuzzleEngine {
  #registry = new Map(); // type string -> puzzle class
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  /** @param {string} type @param {new (...args: any[]) => object} PuzzleClass */
  registerType(type, PuzzleClass) {
    this.#registry.set(type, PuzzleClass);
  }

  /** @param {object} puzzleDef */
  instantiate(puzzleDef) {
    console.warn(`[PuzzleEngine] instantiate() — no puzzle content yet (Milestone 2+).`, puzzleDef);
    return null;
  }
}
