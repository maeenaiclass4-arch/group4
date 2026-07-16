import { EVENTS } from '../core/Config.js';

/**
 * InventorySystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §25).
 *
 * Intended responsibilities (GDD §9):
 *  - Hold the unlimited-capacity item collection for the current save.
 *  - Resolve combine/apply interactions (drag-drop on desktop,
 *    tap-select-then-tap-target on mobile — both funnel through the same
 *    `combine(itemA, itemB)` / `use(item, hotspotId)` API).
 *  - Emit EVENTS.ITEM_COLLECTED so InventoryDock (UI) and SaveManager's
 *    autosave both react independently.
 */
export class InventorySystem {
  #items = [];
  #eventBus;

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get items() {
    return [...this.#items];
  }

  /** @param {string} itemId */
  collect(itemId) {
    console.warn(`[InventorySystem] collect("${itemId}") — no item content yet (Milestone 2+).`);
  }

  hydrate(itemIds = []) {
    this.#items = [...itemIds];
  }
}
