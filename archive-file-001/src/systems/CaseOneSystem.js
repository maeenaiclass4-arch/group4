import { CHAIR_SLOTS, CHAIR_SOLUTION_SLOT } from '../world/LevelLayout.js';

const HATCH_OPEN_ANGLE = -1.3;
const LAMP_TARGET_INTENSITY = 14;

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

    this.chair.userData.onInteract = () => this.advanceChair();
    this.chair.userData.interactable.hint = 'A chair, out of place.';

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
    this.#applyChairTransform();
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
    this.ui.showCaption('Something shifts beneath the desk.');
    this.onStateChanged?.();
  }

  viewPhoto() {
    this.audio.interact();
    this.ui.showCaption('A photograph, pinned above the desk. The chair does not sit like this anymore.');
    if (!this.photoSeen) {
      this.photoSeen = true;
      this.ui.addCasebookEntry('A pinned photograph of this desk — the chair pulled aside, turned toward the window. Not where it stands now.');
      this.onStateChanged?.();
    }
  }

  touchCompartment() {
    if (!this.solved) {
      this.audio.denied();
      this.ui.showCaption('Sealed. Nothing here moves yet.');
      return;
    }
    if (!this.keyCollected) this.collectKey();
  }

  collectKey() {
    if (this.keyCollected) return;
    this.keyCollected = true;
    this.key.visible = false;
    this.audio.pickup();
    this.ui.showCaption('A brass key. Someone meant to come back for this.');
    this.ui.addCasebookEntry('A key, found beneath the false floor of a clerk’s desk — left for whoever finally noticed the chair.');
    this.onStateChanged?.();
  }

  update(dt) {
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
