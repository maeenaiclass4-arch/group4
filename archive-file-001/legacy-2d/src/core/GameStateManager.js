import { EVENTS, GAME_STATES } from './Config.js';

/**
 * GameStateManager.js
 * The single finite-state machine allowed to change top-level game state
 * (GDD §15). Every other system reacts to EVENTS.STATE_CHANGED rather than
 * mutating state directly — this is what keeps "what screen am I on" from
 * turning into a tangle of booleans spread across UI components.
 */

/** Explicit transition table. Any pair not listed here is rejected. */
const TRANSITIONS = {
  [GAME_STATES.BOOT]: [GAME_STATES.LOADING],
  [GAME_STATES.LOADING]: [GAME_STATES.MAIN_MENU],
  [GAME_STATES.MAIN_MENU]: [GAME_STATES.SETTINGS, GAME_STATES.PLAYING],
  [GAME_STATES.SETTINGS]: [GAME_STATES.MAIN_MENU, GAME_STATES.PAUSED],
  [GAME_STATES.PLAYING]: [
    GAME_STATES.PAUSED,
    GAME_STATES.CHAPTER_COMPLETE,
    GAME_STATES.CINEMATIC,
    GAME_STATES.ENDING,
    GAME_STATES.MAIN_MENU,
  ],
  [GAME_STATES.PAUSED]: [GAME_STATES.PLAYING, GAME_STATES.SETTINGS, GAME_STATES.MAIN_MENU],
  [GAME_STATES.CHAPTER_COMPLETE]: [GAME_STATES.PLAYING],
  [GAME_STATES.CINEMATIC]: [GAME_STATES.PLAYING],
  [GAME_STATES.ENDING]: [GAME_STATES.MAIN_MENU],
};

export class GameStateManager {
  #state = GAME_STATES.BOOT;
  #eventBus;
  /** @type {GAME_STATES[keyof GAME_STATES] | null} state to return to after a SETTINGS detour */
  #returnState = null;

  /** @param {import('./EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get state() {
    return this.#state;
  }

  /**
   * @param {string} nextState one of GAME_STATES
   * @param {object} [meta] arbitrary context passed through with the event
   * @returns {boolean} whether the transition was accepted
   */
  transition(nextState, meta = {}) {
    const allowed = TRANSITIONS[this.#state] ?? [];
    if (!allowed.includes(nextState)) {
      console.warn(`[GameStateManager] rejected transition ${this.#state} -> ${nextState}`);
      return false;
    }

    if (nextState === GAME_STATES.SETTINGS) {
      this.#returnState = this.#state;
    }

    const previousState = this.#state;
    this.#state = nextState;
    this.#eventBus.emit(EVENTS.STATE_CHANGED, { previousState, nextState, meta });
    return true;
  }

  /** Convenience: leaves SETTINGS back to whichever state opened it. */
  closeSettings(meta = {}) {
    const target = this.#returnState ?? GAME_STATES.MAIN_MENU;
    this.#returnState = null;
    return this.transition(target, meta);
  }

  is(state) {
    return this.#state === state;
  }
}
