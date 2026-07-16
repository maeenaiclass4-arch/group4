/**
 * InventoryDock.js — SCAFFOLDING, filled in at Milestone 2 (GDD §9, §25).
 * Desktop: side-anchored slide-out dock. Mobile: bottom sheet. Both bind
 * to the same InventorySystem API so there is exactly one interaction
 * model per platform, never divergent logic.
 */
export class InventoryDock {
  constructor(eventBus, inventorySystem) {
    this.eventBus = eventBus;
    this.inventorySystem = inventorySystem;
  }

  mount(container) {
    console.warn('[InventoryDock] mount() — no item content yet (Milestone 2+).');
  }
}
