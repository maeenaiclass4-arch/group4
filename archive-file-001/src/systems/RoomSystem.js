import { EVENTS } from '../core/Config.js';

/**
 * RoomSystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §25).
 *
 * Intended responsibilities (GDD §8, §15):
 *  - Load a room's JSON definition + physical/memory image pair.
 *  - Render hotspots as percentage-positioned DOM elements over the stage.
 *  - Own the Physical ⇄ Memory layer cross-fade (LayerToggleSystem hooks in here).
 *  - Emit EVENTS.ROOM_ENTERED so AchievementSystem/StatsSystem/CinematicSystem
 *    can react without RoomSystem knowing they exist.
 *
 * Kept as an explicit class now (rather than added later) so main.js's
 * composition root and the EventBus wiring pattern don't change shape
 * when real room content lands — only the method bodies below do.
 */
export class RoomSystem {
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  /** @param {string} roomId */
  async loadRoom(roomId) {
    console.warn(`[RoomSystem] loadRoom("${roomId}") — no room content yet (Milestone 2+).`);
  }
}
