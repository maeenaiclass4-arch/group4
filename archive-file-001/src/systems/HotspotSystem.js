/**
 * HotspotSystem.js
 * Pure resolution logic: given a room's hotspot list, the active Memory
 * Layer state, and the current session flags, decide which hotspots are
 * visible right now and what visual/interaction state each is in. No DOM
 * here — RoomView consumes this to decide what to render, which keeps the
 * "what's true about this room" logic testable independent of rendering.
 */
export class HotspotSystem {
  /**
   * @param {object[]} hotspots room.hotspots
   * @param {'physical'|'memory'} layer
   * @returns {object[]} hotspots visible on the current layer
   */
  getVisible(hotspots, layer) {
    return hotspots.filter((hotspot) => hotspot.layer === 'both' || hotspot.layer === layer);
  }

  /**
   * Resolves a hotspot's effective state ('locked' | 'open' | 'default')
   * by combining its JSON-declared default with session flags recorded
   * once its puzzle has been solved or its exit opened.
   * @param {object} hotspot
   * @param {object} sessionState
   */
  resolveState(hotspot, sessionState) {
    if (hotspot.action?.type === 'puzzle') {
      const solved = sessionState.flags[`puzzle_solved_${hotspot.action.puzzleId}`] === true;
      return solved ? 'open' : (hotspot.state ?? 'default');
    }
    if (hotspot.action?.type === 'useItem') {
      const opened = sessionState.flags[`hotspot_opened_${hotspot.id}`] === true;
      return opened ? 'open' : (hotspot.state ?? 'default');
    }
    return hotspot.state ?? 'default';
  }
}
