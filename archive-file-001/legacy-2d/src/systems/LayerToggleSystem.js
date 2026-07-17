import { EVENTS } from '../core/Config.js';

/**
 * LayerToggleSystem.js
 * Owns the Physical ⇄ Memory layer state — the game's signature mechanic
 * (GDD §3, §5, §21). Reset to 'physical' on every room entry so a layer
 * choice never silently carries across rooms. Bound to InputManager's
 * "toggleLayer" semantic action (Space) by main.js, and to the on-screen
 * layer button by RoomView — both just call toggle().
 */
export class LayerToggleSystem {
  #layer = 'physical';
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get layer() {
    return this.#layer;
  }

  reset() {
    this.#layer = 'physical';
    this.#eventBus.emit(EVENTS.LAYER_CHANGED, { layer: this.#layer });
  }

  toggle() {
    this.#layer = this.#layer === 'physical' ? 'memory' : 'physical';
    this.#eventBus.emit(EVENTS.LAYER_CHANGED, { layer: this.#layer });
    return this.#layer;
  }
}
