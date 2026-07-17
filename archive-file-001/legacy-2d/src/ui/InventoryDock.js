import { EVENTS } from '../core/Config.js';
import { t } from '../core/i18n.js';
import { h, mount } from './dom.js';

/**
 * InventoryDock.js
 * Persistent bottom dock (GDD §9). Interaction model is the same on
 * desktop and mobile — tap/click to select, tap/click a hotspot to apply
 * — which sidesteps drag-and-drop's accidental-scroll problem on touch
 * and keeps gameplay code 100% input-agnostic (GDD §22).
 *
 * Self-subscribes to EVENTS.ITEM_COLLECTED rather than relying on callers
 * to remember to call render() after collecting an item — InventorySystem
 * only ever needs to emit the event, same one-way pattern as AchievementToast.
 */
export class InventoryDock {
  #eventBus;
  #inventorySystem;
  #container;
  #selectedItemId = null;

  /**
   * @param {import('../core/EventBus.js').EventBus} eventBus
   * @param {import('../systems/InventorySystem.js').InventorySystem} inventorySystem
   */
  constructor(eventBus, inventorySystem) {
    this.#eventBus = eventBus;
    this.#inventorySystem = inventorySystem;
    this.#eventBus.on(EVENTS.ITEM_COLLECTED, () => this.render());
  }

  get selectedItemId() {
    return this.#selectedItemId;
  }

  clearSelection() {
    this.#selectedItemId = null;
    this.render();
  }

  mount(container) {
    this.#container = container;
    this.render();
  }

  #select(itemId) {
    this.#selectedItemId = this.#selectedItemId === itemId ? null : itemId;
    this.render();
  }

  render() {
    if (!this.#container) return;
    const ids = this.#inventorySystem.items;

    const items =
      ids.length === 0
        ? [h('div', { class: 'inventory-dock__empty' }, [t('inventory.empty')])]
        : ids.map((id) => {
            const def = this.#inventorySystem.getDef(id);
            const label = def ? t(def.nameKey) : id;
            const selected = id === this.#selectedItemId;
            return h(
              'button',
              {
                class: `inventory-dock__item${selected ? ' is-selected' : ''}`,
                onClick: () => this.#select(id),
                'aria-label': label,
                title: label,
              },
              [h('span', { class: `inventory-dock__icon inventory-icon--${def?.icon ?? 'default'}` })],
            );
          });

    mount(
      this.#container,
      h('div', { class: 'inventory-dock' }, [
        h('div', { class: 'inventory-dock__label' }, [t('inventory.title')]),
        h('div', { class: 'inventory-dock__items' }, items),
      ]),
    );
  }
}
