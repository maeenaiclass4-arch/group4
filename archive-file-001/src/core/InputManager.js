/**
 * Pointer-lock mouse-look + WASD keyboard state, plus a single "interact"
 * click channel — and the equivalent for touch. `keys` and `lookDelta*`
 * are the shared surface both schemes write into, so PlayerController and
 * InteractionSystem never need to know which one is active; TouchControls
 * (mobile) feeds this exact same state instead of going through a parallel
 * code path.
 */
export class InputManager {
  keys = new Set();
  lookDeltaX = 0;
  lookDeltaY = 0;
  isLocked = false;
  isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  #canvas;
  #onInteract = null;

  constructor(canvas) {
    this.#canvas = canvas;
  }

  attach() {
    document.addEventListener('keydown', (e) => this.keys.add(e.code));
    document.addEventListener('keyup', (e) => this.keys.delete(e.code));

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.#canvas;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      this.lookDeltaX += e.movementX || 0;
      this.lookDeltaY += e.movementY || 0;
    });

    this.#canvas.addEventListener('click', () => {
      // Touch fires a synthesized click too, but pointer lock isn't a real
      // concept on touch devices — TouchControls/main.js's touch start flow
      // owns engagement there instead, so this click is a no-op for touch.
      if (this.isTouch) return;
      if (!this.isLocked) {
        this.#canvas.requestPointerLock();
        return;
      }
      this.#onInteract?.();
    });
  }

  requestLock() {
    this.#canvas.requestPointerLock();
  }

  onInteract(handler) {
    this.#onInteract = handler;
  }

  /** Lets touch's dedicated interact button reuse the exact same handler as a real click. */
  triggerInteract() {
    this.#onInteract?.();
  }

  consumeLookDelta() {
    const d = { x: this.lookDeltaX, y: this.lookDeltaY };
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    return d;
  }

  isDown(...codes) {
    return codes.some((c) => this.keys.has(c));
  }
}
