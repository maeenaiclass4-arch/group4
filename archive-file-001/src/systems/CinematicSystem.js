import { EVENTS } from '../core/Config.js';

/**
 * CinematicSystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §12.9, §25).
 *
 * Intended responsibilities:
 *  - `playBeat(beatId)` looks up data/cinematics.json for
 *    { duration, desaturate, audioCue, holdFrame } and plays a brief
 *    (2-4s), always-skippable discovery beat via CSS/canvas only — no
 *    video assets, keeping it inside the performance budget (§23).
 *  - Respects prefers-reduced-motion and the manual Settings toggle,
 *    falling back to an audio sting + fade with no visual hold.
 *  - Listens for EVENTS.CINEMATIC_BEAT_REQUESTED rather than being called
 *    directly, so any future system can trigger a beat by emitting one event.
 */
export class CinematicSystem {
  #eventBus;
  #reduceMotion = false;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  init() {
    this.#eventBus.on(EVENTS.CINEMATIC_BEAT_REQUESTED, ({ beatId }) => this.playBeat(beatId));
  }

  setReduceMotion(enabled) {
    this.#reduceMotion = enabled;
  }

  /** @param {string} beatId */
  playBeat(beatId) {
    console.warn(`[CinematicSystem] playBeat("${beatId}") — no cinematic content yet (Milestone 2+).`, {
      reduceMotion: this.#reduceMotion,
    });
  }
}
