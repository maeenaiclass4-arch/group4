import { CHAIR_SLOTS, CHAIR_SOLUTION_SLOT } from '../world/LevelLayout.js';
import { createGuideGlow } from '../world/GuideGlow.js';

const HATCH_OPEN_ANGLE = -1.3;
const LAMP_TARGET_INTENSITY = 14;
const CHAIR_TWEEN_DURATION = 0.32;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function shortestAngleDelta(from, to) {
  const twoPi = Math.PI * 2;
  let delta = (to - from) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  if (delta < -Math.PI) delta += twoPi;
  return delta;
}

/**
 * Case 001 — Observation (GDD §8). The entire "puzzle" is: does the chair's
 * current arrangement match the pinned photograph? Nothing here is a menu
 * or a typed value — advancing the chair is the only input, and the photo
 * (ReferencePhoto.js) is the only source of the answer.
 */
export class CaseOneSystem {
  constructor({ chair, hatch, key, corkboard, statusLamp, audio, ui, onStateChanged }) {
    this.chair = chair;
    this.hatch = hatch;
    this.key = key;
    this.corkboard = corkboard;
    this.statusLamp = statusLamp;
    this.audio = audio;
    this.ui = ui;
    this.onStateChanged = onStateChanged;

    this.chairSlot = 0;
    this.solved = false;
    this.keyCollected = false;
    this.photoSeen = false;

    this.hatchProgress = 0;
    this.hatchTarget = 0;
    this.lampIntensity = 0;

    this.chairTweenT = 1;
    this.chairFrom = { x: 0, z: 0, ry: 0 };
    this.chairTo = { x: 0, z: 0, ry: 0 };

    // Diegetic guidance (no arrows, no UI marker): a soft light quietly
    // finds whichever object is the next meaningful step — the photo
    // first, then the chair, then the key once it's revealed.
    this.elapsed = 0;
    this.corkboardGlow = createGuideGlow(this.corkboard, { offset: [0.15, 0.1, -0.05] });
    this.chairGlow = createGuideGlow(this.chair, { offset: [0, 0.55, 0] });
    this.keyGlow = createGuideGlow(this.key, { offset: [0, 0.06, 0], peak: 1.4, distance: 0.9 });

    this.chair.userData.onInteract = () => this.advanceChair();

    const compartment = this.hatch.parent;
    compartment.userData.onInteract = () => this.touchCompartment();

    this.key.userData.onInteract = () => this.collectKey();

    this.corkboard.userData.onInteract = () => this.viewPhoto();
  }

  hydrate(state) {
    this.chairSlot = state?.chairSlot ?? 0;
    this.solved = !!state?.solved;
    this.keyCollected = !!state?.keyCollected;
    this.#applyChairTransform();
    this.chairTweenT = 1; // hydration is instant, never tweened
    if (this.solved) {
      this.hatchProgress = 1;
      this.hatchTarget = 1;
      this.hatch.rotation.x = HATCH_OPEN_ANGLE;
      this.lampIntensity = LAMP_TARGET_INTENSITY;
      if (this.statusLamp) this.statusLamp.intensity = LAMP_TARGET_INTENSITY;
    }
    this.key.visible = this.solved && !this.keyCollected;
  }

  serialize() {
    return { chairSlot: this.chairSlot, solved: this.solved, keyCollected: this.keyCollected };
  }

  #applyChairTransform() {
    const slot = CHAIR_SLOTS[this.chairSlot];
    this.chair.position.set(slot.x, 0, slot.z);
    this.chair.rotation.y = slot.ry;
  }

  advanceChair() {
    this.chairSlot = (this.chairSlot + 1) % CHAIR_SLOTS.length;
    const target = CHAIR_SLOTS[this.chairSlot];
    this.chairFrom = { x: this.chair.position.x, z: this.chair.position.z, ry: this.chair.rotation.y };
    this.chairTo = { x: target.x, z: target.z, ry: this.chair.rotation.y + shortestAngleDelta(this.chair.rotation.y, target.ry) };
    this.chairTweenT = 0;
    this.audio.interact();

    if (!this.solved && this.chairSlot === CHAIR_SOLUTION_SLOT) {
      this.#solve();
    } else {
      this.onStateChanged?.();
    }
  }

  #solve() {
    this.solved = true;
    this.hatchTarget = 1;
    this.key.visible = true;
    this.audio.mechanismOpen();
    this.ui.showCaption('case1.solve.caption');
    this.onStateChanged?.();
  }

  viewPhoto() {
    this.audio.interact();
    this.ui.showCaption('case1.photo.caption');
    if (!this.photoSeen) {
      this.photoSeen = true;
      this.ui.addCasebookEntry('case1.photo.entry');
      this.onStateChanged?.();
    }
  }

  touchCompartment() {
    if (!this.solved) {
      this.audio.denied();
      this.ui.pulseReticle('denied');
      this.ui.showCaption('case1.compartment.denied');
      return;
    }
    if (!this.keyCollected) this.collectKey();
  }

  collectKey() {
    if (this.keyCollected) return;
    this.keyCollected = true;
    this.key.visible = false;
    this.audio.pickup();
    this.ui.showCaption('case1.key.caption');
    this.ui.addCasebookEntry('case1.key.entry');
    this.onStateChanged?.();
  }

  update(dt) {
    this.elapsed += dt;
    this.corkboardGlow.setActive(!this.photoSeen);
    this.chairGlow.setActive(!this.solved);
    this.keyGlow.setActive(this.solved && !this.keyCollected);
    this.corkboardGlow.update(dt, this.elapsed);
    this.chairGlow.update(dt, this.elapsed);
    this.keyGlow.update(dt, this.elapsed);

    if (this.chairTweenT < 1) {
      this.chairTweenT = Math.min(1, this.chairTweenT + dt / CHAIR_TWEEN_DURATION);
      const e = easeOutCubic(this.chairTweenT);
      this.chair.position.x = this.chairFrom.x + (this.chairTo.x - this.chairFrom.x) * e;
      this.chair.position.z = this.chairFrom.z + (this.chairTo.z - this.chairFrom.z) * e;
      this.chair.rotation.y = this.chairFrom.ry + (this.chairTo.ry - this.chairFrom.ry) * e;
    }
    if (this.hatchProgress < this.hatchTarget) {
      this.hatchProgress = Math.min(this.hatchTarget, this.hatchProgress + dt * 1.8);
      this.hatch.rotation.x = HATCH_OPEN_ANGLE * this.hatchProgress;
    }
    const targetLamp = this.keyCollected ? LAMP_TARGET_INTENSITY : 0;
    if (Math.abs(this.lampIntensity - targetLamp) > 0.01) {
      this.lampIntensity += (targetLamp - this.lampIntensity) * dt * 1.5;
      if (this.statusLamp) this.statusLamp.intensity = this.lampIntensity;
    }
    if (this.key.visible) {
      this.key.position.y = 0.05 + Math.sin(performance.now() * 0.0025) * 0.01;
      this.key.rotation.y += dt * 0.6;
    }
  }
}
