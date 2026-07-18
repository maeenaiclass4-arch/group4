import { createGuideGlow } from '../world/GuideGlow.js';

const HATCH_OPEN_ANGLE = -1.3;
const LAMP_TARGET_INTENSITY = 14;
const LENS_TWEEN_DURATION = 0.28;
const BEAM_TARGET_OPACITY = 0.55;

// Four fixed rotations the lens can be set to; index 2 is the one that
// actually lines up with the floor mark — same state-cycle-to-match
// structure as Case 001 (chair vs. photo) and Case 002 (dial vs. horn),
// judged by alignment instead of position or pitch.
const LENS_STATE_COUNT = 4;
const LENS_SOLUTION_INDEX = 2;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Case 003 — Light Archive (Conservatory). The mark is a fixed reference
 * point; the lens cycles through four rotations, and only one sends the
 * beam to the mark. Solving reveals the beam, opens the compartment, and
 * leaves a glass token — the third re-skin of the same underlying puzzle
 * shape as Case 001 and Case 002.
 */
export class CaseThreeSystem {
  constructor({ mark, lens, yoke, beamMat, hatch, key, compartmentGroup, statusLamp, audio, ui, onStateChanged }) {
    this.mark = mark;
    this.lens = lens;
    this.yoke = yoke;
    this.beamMat = beamMat;
    this.hatch = hatch;
    this.key = key;
    this.compartmentGroup = compartmentGroup;
    this.statusLamp = statusLamp;
    this.audio = audio;
    this.ui = ui;
    this.onStateChanged = onStateChanged;

    this.lensState = 0;
    this.solved = false;
    this.keyCollected = false;
    this.markSeen = false;

    this.hatchProgress = 0;
    this.hatchTarget = 0;
    this.lampIntensity = 0;
    this.beamOpacity = 0;

    this.lensTweenT = 1;
    this.lensFromAngle = 0;
    this.lensToAngle = 0;

    this.elapsed = 0;
    this.markGlow = createGuideGlow(this.mark, { offset: [0, 0.3, 0], color: 0xeadcff });
    this.lensGlow = createGuideGlow(this.lens, { offset: [0, 1.1, 0], color: 0xeadcff });
    this.keyGlow = createGuideGlow(this.key, { offset: [0, 0.06, 0], peak: 1.4, distance: 0.9, color: 0xeadcff });

    this.lens.userData.onInteract = () => this.advanceLens();
    this.compartmentGroup.userData.onInteract = () => this.touchCompartment();
    this.key.userData.onInteract = () => this.collectKey();
    this.mark.userData.onInteract = () => this.touchMark();
  }

  hydrate(state) {
    this.lensState = state?.lensState ?? 0;
    this.solved = !!state?.solved;
    this.keyCollected = !!state?.keyCollected;
    const angle = this.lensState * (Math.PI / 2);
    this.yoke.rotation.y = angle;
    this.lensFromAngle = angle;
    this.lensToAngle = angle;
    this.lensTweenT = 1;
    if (this.solved) {
      this.hatchProgress = 1;
      this.hatchTarget = 1;
      this.hatch.rotation.x = HATCH_OPEN_ANGLE;
      this.lampIntensity = LAMP_TARGET_INTENSITY;
      if (this.statusLamp) this.statusLamp.intensity = LAMP_TARGET_INTENSITY;
      this.beamOpacity = BEAM_TARGET_OPACITY;
      this.beamMat.opacity = BEAM_TARGET_OPACITY;
    }
    this.key.visible = this.solved && !this.keyCollected;
  }

  serialize() {
    return { lensState: this.lensState, solved: this.solved, keyCollected: this.keyCollected };
  }

  advanceLens() {
    this.lensState = (this.lensState + 1) % LENS_STATE_COUNT;
    this.lensFromAngle = this.yoke.rotation.y;
    this.lensToAngle = this.lensFromAngle + Math.PI / 2;
    this.lensTweenT = 0;
    this.audio.interact();
    this.ui.showCaption('case3.mirror.caption');

    if (!this.solved && this.lensState === LENS_SOLUTION_INDEX) {
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
    this.ui.showCaption('case3.solve.caption');
    this.onStateChanged?.();
  }

  touchMark() {
    this.audio.interact();
    this.ui.showCaption('case3.mark.caption');
    if (!this.markSeen) {
      this.markSeen = true;
      this.ui.addCasebookEntry('case3.mark.entry');
      this.onStateChanged?.();
    }
  }

  touchCompartment() {
    if (!this.solved) {
      this.audio.denied();
      this.ui.pulseReticle('denied');
      this.ui.showCaption('case3.compartment.denied');
      return;
    }
    if (!this.keyCollected) this.collectKey();
  }

  collectKey() {
    if (this.keyCollected) return;
    this.keyCollected = true;
    this.key.visible = false;
    this.audio.pickup();
    this.ui.showCaption('case3.key.caption');
    this.ui.addCasebookEntry('case3.key.entry');
    this.onStateChanged?.();

    setTimeout(() => {
      this.audio.caseClosed();
      this.ui.showCaption('case3.closed.caption');
      this.ui.addCasebookEntry('case3.closed.entry');
      this.onStateChanged?.();
    }, 2200);
  }

  update(dt) {
    this.elapsed += dt;
    this.markGlow.setActive(!this.markSeen);
    this.lensGlow.setActive(!this.solved);
    this.keyGlow.setActive(this.solved && !this.keyCollected);
    this.markGlow.update(dt, this.elapsed);
    this.lensGlow.update(dt, this.elapsed);
    this.keyGlow.update(dt, this.elapsed);

    if (this.lensTweenT < 1) {
      this.lensTweenT = Math.min(1, this.lensTweenT + dt / LENS_TWEEN_DURATION);
      const e = easeOutCubic(this.lensTweenT);
      this.yoke.rotation.y = this.lensFromAngle + (this.lensToAngle - this.lensFromAngle) * e;
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
    const targetBeam = this.solved ? BEAM_TARGET_OPACITY : 0;
    if (Math.abs(this.beamOpacity - targetBeam) > 0.005) {
      this.beamOpacity += (targetBeam - this.beamOpacity) * dt * 1.5;
      this.beamMat.opacity = this.beamOpacity;
    }
    if (this.key.visible) {
      this.key.position.y = 0.06 + Math.sin(performance.now() * 0.0025) * 0.01;
      this.key.rotation.y += dt * 0.6;
    }
  }
}
