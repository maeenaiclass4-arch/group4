const JOYSTICK_MAX_RADIUS = 40; // px — must roughly match the CSS knob's travel range
const MOVE_THRESHOLD = 0.28; // fraction of max radius before a direction counts as "held"
const TOUCH_LOOK_SCALE = 1.5; // touch drags are shorter/less precise than a mouse sweep

function findTouch(touchList, id) {
  for (const t of touchList) if (t.identifier === id) return t;
  return null;
}

/**
 * Virtual joystick (movement) + drag-anywhere look + interact/casebook
 * buttons, for devices with no keyboard/mouse/pointer-lock. Writes into
 * the exact same InputManager state (`keys`, `lookDeltaX/Y`) a real
 * keyboard+mouse session would, so the rest of the game never branches on
 * input scheme.
 */
export class TouchControls {
  constructor({ input, onInteract, onCasebookToggle }) {
    this.input = input;
    this.onInteract = onInteract;
    this.onCasebookToggle = onCasebookToggle;

    this.root = document.getElementById('touch-controls');
    this.joystickBase = document.getElementById('touch-joystick');
    this.joystickKnob = document.getElementById('touch-joystick-knob');
    this.lookLayer = document.getElementById('touch-look-layer');
    this.interactBtn = document.getElementById('touch-interact-btn');
    this.casebookBtn = document.getElementById('touch-casebook-btn');

    this.#attachJoystick();
    this.#attachLook();
    this.#attachButtons();
  }

  show() {
    this.root.hidden = false;
  }

  #setMoveKeys(nx, ny) {
    const { keys } = this.input;
    keys.delete('KeyW');
    keys.delete('KeyS');
    keys.delete('KeyA');
    keys.delete('KeyD');
    if (ny < -MOVE_THRESHOLD) keys.add('KeyW');
    if (ny > MOVE_THRESHOLD) keys.add('KeyS');
    if (nx < -MOVE_THRESHOLD) keys.add('KeyA');
    if (nx > MOVE_THRESHOLD) keys.add('KeyD');
  }

  #attachJoystick() {
    let activeId = null;
    let baseRect = null;

    const update = (touch) => {
      const cx = baseRect.left + baseRect.width / 2;
      const cy = baseRect.top + baseRect.height / 2;
      const dx = touch.clientX - cx;
      const dy = touch.clientY - cy;
      const dist = Math.min(Math.hypot(dx, dy), JOYSTICK_MAX_RADIUS);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * dist;
      const ky = Math.sin(angle) * dist;
      this.joystickKnob.style.transform = `translate(${kx}px, ${ky}px)`;
      this.#setMoveKeys(kx / JOYSTICK_MAX_RADIUS, ky / JOYSTICK_MAX_RADIUS);
    };

    const start = (e) => {
      const t = e.changedTouches[0];
      activeId = t.identifier;
      baseRect = this.joystickBase.getBoundingClientRect();
      update(t);
      e.preventDefault();
    };
    const move = (e) => {
      const t = findTouch(e.changedTouches, activeId);
      if (!t) return;
      update(t);
      e.preventDefault();
    };
    const end = (e) => {
      if (!findTouch(e.changedTouches, activeId)) return;
      activeId = null;
      this.joystickKnob.style.transform = 'translate(0, 0)';
      this.#setMoveKeys(0, 0);
    };

    this.joystickBase.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end, { passive: true });
    document.addEventListener('touchcancel', end, { passive: true });
  }

  #attachLook() {
    let activeId = null;
    let lastX = 0;
    let lastY = 0;

    const start = (e) => {
      const t = e.changedTouches[0];
      activeId = t.identifier;
      lastX = t.clientX;
      lastY = t.clientY;
    };
    const move = (e) => {
      const t = findTouch(e.changedTouches, activeId);
      if (!t) return;
      this.input.lookDeltaX += (t.clientX - lastX) * TOUCH_LOOK_SCALE;
      this.input.lookDeltaY += (t.clientY - lastY) * TOUCH_LOOK_SCALE;
      lastX = t.clientX;
      lastY = t.clientY;
      e.preventDefault();
    };
    const end = (e) => {
      if (!findTouch(e.changedTouches, activeId)) return;
      activeId = null;
    };

    this.lookLayer.addEventListener('touchstart', start, { passive: true });
    this.lookLayer.addEventListener('touchmove', move, { passive: false });
    this.lookLayer.addEventListener('touchend', end, { passive: true });
    this.lookLayer.addEventListener('touchcancel', end, { passive: true });
  }

  #attachButtons() {
    this.interactBtn.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onInteract?.();
      },
      { passive: false },
    );
    this.casebookBtn.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onCasebookToggle?.();
      },
      { passive: false },
    );
  }
}
