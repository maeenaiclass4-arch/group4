/**
 * EventBus.js
 * Minimal synchronous pub/sub. Every cross-system communication in the
 * codebase goes through one shared instance of this class — systems never
 * hold direct references to each other (see GDD §15). This keeps content
 * systems like AchievementSystem or StatsSystem addable later purely as
 * new listeners, with zero changes to whatever emits the event.
 */
export class EventBus {
  #listeners = new Map(); // eventName -> Set<handler>

  /**
   * @param {string} eventName
   * @param {(payload: any) => void} handler
   * @returns {() => void} unsubscribe function
   */
  on(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(`EventBus.on("${eventName}") requires a function handler`);
    }
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, new Set());
    }
    this.#listeners.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  /**
   * Subscribe once; auto-unsubscribes after the first matching emit.
   * @param {string} eventName
   * @param {(payload: any) => void} handler
   */
  once(eventName, handler) {
    const wrapped = (payload) => {
      this.off(eventName, wrapped);
      handler(payload);
    };
    return this.on(eventName, wrapped);
  }

  /**
   * @param {string} eventName
   * @param {(payload: any) => void} handler
   */
  off(eventName, handler) {
    this.#listeners.get(eventName)?.delete(handler);
  }

  /**
   * Synchronously invokes every handler registered for eventName.
   * A throwing handler is caught and logged so one bad listener can never
   * break the emit chain for the rest (critical: SaveManager must still
   * run even if e.g. a UI toast listener throws).
   * @param {string} eventName
   * @param {any} [payload]
   */
  emit(eventName, payload) {
    const handlers = this.#listeners.get(eventName);
    if (!handlers || handlers.size === 0) return;
    for (const handler of [...handlers]) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] listener for "${eventName}" threw:`, error);
      }
    }
  }

  /** Removes every listener for a given event, or every listener if no event is given. */
  clear(eventName) {
    if (eventName) {
      this.#listeners.delete(eventName);
    } else {
      this.#listeners.clear();
    }
  }
}
