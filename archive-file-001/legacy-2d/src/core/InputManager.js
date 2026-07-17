import { EVENTS } from './Config.js';

/**
 * InputManager.js
 * Normalizes mouse, touch, and keyboard into the same semantic events so
 * gameplay/UI code never branches on device type (GDD §15, §22). Built on
 * the Pointer Events API, which already unifies mouse/touch/pen at the
 * browser level — this class's job is to layer *semantic* meaning
 * (a "back" action, a "toggleLayer" action) on top of raw input.
 *
 * Room/hotspot interaction (M2+) will consume INPUT_POINTER_DOWN/UP;
 * menu components in M1 mostly use plain DOM listeners for simplicity and
 * only lean on this class for the global keyboard shortcuts below.
 */

/** Keyboard → semantic action map. Extend here, never in a component. */
const KEY_ACTIONS = Object.freeze({
  Escape: 'back',
  ' ': 'toggleLayer',
  i: 'toggleInventory',
  I: 'toggleInventory',
});

export class InputManager {
  #eventBus;
  #enabled = true;

  // Instance-field arrow functions: auto-bound to `this` and assignable,
  // so the same reference can be passed to add/removeEventListener —
  // a private *method* (declared with `#name() {}`) is not assignable and
  // would throw if rebound in the constructor.
  #onPointerDown = (event) => {
    if (!this.#enabled) return;
    this.#eventBus.emit(EVENTS.INPUT_POINTER_DOWN, {
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
      target: event.target,
    });
  };

  #onPointerUp = (event) => {
    if (!this.#enabled) return;
    this.#eventBus.emit(EVENTS.INPUT_POINTER_UP, {
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
      target: event.target,
    });
  };

  #onKeyDown = (event) => {
    if (!this.#enabled) return;
    // Never intercept keystrokes aimed at a text field (settings inputs, future notebook search).
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;

    this.#eventBus.emit(EVENTS.INPUT_KEY_DOWN, { key: event.key });

    const action = KEY_ACTIONS[event.key];
    if (action) {
      this.#eventBus.emit(EVENTS.INPUT_ACTION, { action, sourceKey: event.key });
    }
  };

  /** @param {import('./EventBus.js').EventBus} eventBus */
  constructor(eventBus) {
    this.#eventBus = eventBus;
  }

  attach(target = window) {
    target.addEventListener('pointerdown', this.#onPointerDown, { passive: true });
    target.addEventListener('pointerup', this.#onPointerUp, { passive: true });
    window.addEventListener('keydown', this.#onKeyDown);
  }

  detach(target = window) {
    target.removeEventListener('pointerdown', this.#onPointerDown);
    target.removeEventListener('pointerup', this.#onPointerUp);
    window.removeEventListener('keydown', this.#onKeyDown);
  }

  /** Menus/overlays that manage their own focus trapping can suspend global shortcuts. */
  setEnabled(enabled) {
    this.#enabled = enabled;
  }
}
