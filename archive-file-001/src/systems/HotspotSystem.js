/**
 * HotspotSystem.js — SCAFFOLDING, filled in at Milestone 2 (GDD §25).
 *
 * Intended responsibilities (GDD §8, §22):
 *  - Convert a room's percentage-based hotspot polygons into hit-testable
 *    DOM regions that stay correctly positioned as the letterboxed stage
 *    resizes (desktop resize, mobile orientation change).
 *  - Translate InputManager's normalized pointer events into
 *    `interact(hotspotId)` calls — the point where input becomes gameplay.
 *  - Drive the idle-glint affordance animation (GDD §21) and its
 *    Accessibility "always visible" toggle.
 */
export class HotspotSystem {
  /** @param {import('../core/EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  /** @param {object[]} hotspotDefs */
  mount(hotspotDefs) {
    console.warn('[HotspotSystem] mount() — no room content yet (Milestone 2+).', hotspotDefs);
  }

  unmount() {
    // No-op until hotspots exist to tear down.
  }
}
