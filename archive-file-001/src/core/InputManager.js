/**
 * Pointer-lock mouse-look + WASD keyboard state, plus a single "interact"
 * click channel. Desktop-first (GDD §15); touch input is a later pass.
 */
export class InputManager {
  keys = new Set();
  lookDeltaX = 0;
  lookDeltaY = 0;
  isLocked = false;

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
