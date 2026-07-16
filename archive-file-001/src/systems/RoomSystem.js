import { EVENTS } from '../core/Config.js';
import { rooms } from '../data/index.js';

/**
 * RoomSystem.js
 * Data/state authority for "what room is the player in." Rendering (scene
 * art, hotspots, chrome) lives in the RoomView UI component — this class
 * only knows the room graph and the current position in it, so it stays
 * trivially testable and reusable if the renderer ever changes.
 */
export class RoomSystem {
  #eventBus;
  #currentRoom = null;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get currentRoom() {
    return this.#currentRoom;
  }

  /** @param {string} roomId */
  loadRoom(roomId) {
    const def = rooms.get(roomId);
    if (!def) {
      console.error(`[RoomSystem] unknown room "${roomId}"`);
      return null;
    }
    this.#currentRoom = def;
    this.#eventBus.emit(EVENTS.ROOM_ENTERED, { roomId });
    return def;
  }

  getHotspot(hotspotId) {
    return this.#currentRoom?.hotspots.find((h) => h.id === hotspotId) ?? null;
  }
}
