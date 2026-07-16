/**
 * LayerToggleSystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §25).
 *
 * Intended responsibilities (GDD §3, §5, §21):
 *  - Own the Physical ⇄ Memory layer cross-fade — the game's signature,
 *    most-repeated mechanic and animation.
 *  - Bound to InputManager's "toggleLayer" semantic action (Space on
 *    desktop, a dedicated UI button on both platforms).
 *  - Reports current layer to AudioManager.setRoomState() so the ambient
 *    memory-layer stem (§12.10) fades in/out in sync.
 */
export class LayerToggleSystem {
  #layer = 'physical'; // 'physical' | 'memory'
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get layer() {
    return this.#layer;
  }

  toggle() {
    console.warn('[LayerToggleSystem] toggle() — no room content yet (Milestone 2+).');
  }
}
