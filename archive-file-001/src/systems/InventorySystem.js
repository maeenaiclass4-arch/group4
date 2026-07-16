import { EVENTS } from '../core/Config.js';
import { items } from '../data/index.js';

/**
 * InventorySystem.js
 * Unlimited-capacity item collection (GDD §9). Only ever emits events on
 * mutation — SessionStore is what actually persists the change.
 */
export class InventorySystem {
  #eventBus;
  #items = [];

  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  get items() {
    return [...this.#items];
  }

  has(itemId) {
    return this.#items.includes(itemId);
  }

  /** @param {string} itemId */
  collect(itemId) {
    if (this.#items.includes(itemId)) return;
    this.#items.push(itemId);
    this.#eventBus.emit(EVENTS.ITEM_COLLECTED, { itemId });
  }

  getDef(itemId) {
    return items.get(itemId) ?? null;
  }

  hydrate(itemIds = []) {
    this.#items = [...itemIds];
  }
}
