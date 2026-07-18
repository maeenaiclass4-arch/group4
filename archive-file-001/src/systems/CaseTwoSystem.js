import { createGuideGlow } from '../world/GuideGlow.js';

const HATCH_OPEN_ANGLE = -1.3;
const LAMP_TARGET_INTENSITY = 14;
const DIAL_TWEEN_DURATION = 0.28;

// Four pitches the dial can select; index 2 (523Hz / C5) is the one the
// horn's reference recording actually plays — same underlying verb as
// Case 001 (cycle through fixed states until one matches a fixed
// reference), just judged by ear instead of by eye.
const DIAL_FREQS = [392, 440, 523, 587];
const DIAL_SOLUTION_INDEX = 2;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Case 002 — Audio Archive (Substrata / Sound Vaults). The horn plays a
 * fixed reference tone on demand; the dial cycles through four pipes, each
 * with its own tone; landing the dial on the one pipe whose tone matches
 * the horn's solves the case. Deliberately the same state-machine shape as
 * CaseOneSystem, re-skinned — see the classroom explanation this was built
 * for: the puzzle "verb" changes (sight vs. sound), the underlying
 * structure doesn't.
 */
export class CaseTwoSystem {
  constructor({ horn, dial, needleGroup, hatch, key, compartmentGroup, statusLamp, audio, ui, onStateChanged }) {
    this.horn = horn;
    this.dial = dial;
    this.needleGroup = needleGroup;
    this.hatch = hatch;
    this.key = key;
    this.compartmentGroup = compartmentGroup;
    this.statusLamp = statusLamp;
    this.audio = audio;
    this.ui = ui;
    this.onStateChanged = onStateChanged;

    this.dialState = 0;
    this.solved = false;
    this.keyCollected = false;
    this.hornHeard = false;

    this.hatchProgress = 0;
    this.hatchTarget = 0;
    this.lampIntensity = 0;

    this.dialTweenT = 1;
    this.dialFromAngle = 0;
    this.dialToAngle = 0;

    this.elapsed = 0;
    this.hornGlow = createGuideGlow(this.horn, { offset: [0, 0.55, 0], color: 0x9fc4dd });
    this.dialGlow = createGuideGlow(this.dial, { offset: [0, 0.95, 0], color: 0x9fc4dd });
    this.keyGlow = createGuideGlow(this.key, { offset: [0, 0.06, 0], peak: 1.4, distance: 0.9, color: 0x9fc4dd });

    this.dial.userData.onInteract = () => this.advanceDial();
    this.compartmentGroup.userData.onInteract = () => this.touchCompartment();
    this.key.userData.onInteract = () => this.collectKey();
    this.horn.userData.onInteract = () => this.touchHorn();
  }

  hydrate(state) {
    this.dialState = state?.dialState ?? 0;
    this.solved = !!state?.solved;
    this.keyCollected = !!state?.keyCollected;
    const angle = this.dialState * (Math.PI / 2);
    this.needleGroup.rotation.y = angle;
    this.dialFromAngle = angle;
    this.dialToAngle = angle;
    this.dialTweenT = 1;
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
    return { dialState: this.dialState, solved: this.solved, keyCollected: this.keyCollected };
  }

  advanceDial() {
    this.dialState = (this.dialState + 1) % DIAL_FREQS.length;
    this.dialFromAngle = this.needleGroup.rotation.y;
    this.dialToAngle = this.dialFromAngle + Math.PI / 2;
    this.dialTweenT = 0;
    this.audio.chime(DIAL_FREQS[this.dialState]);
    this.ui.showCaption('case2.dial.caption');

    if (!this.solved && this.dialState === DIAL_SOLUTION_INDEX) {
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
    this.ui.showCaption('case2.solve.caption');
    this.onStateChanged?.();
  }

  touchHorn() {
    this.audio.chime(DIAL_FREQS[DIAL_SOLUTION_INDEX], { duration: 0.4, gain: 0.1 });
    this.ui.showCaption('case2.horn.caption');
    if (!this.hornHeard) {
      this.hornHeard = true;
      this.ui.addCasebookEntry('case2.horn.entry');
      this.onStateChanged?.();
    }
  }

  touchCompartment() {
    if (!this.solved) {
      this.audio.denied();
      this.ui.pulseReticle('denied');
      this.ui.showCaption('case2.compartment.denied');
      return;
    }
    if (!this.keyCollected) this.collectKey();
  }

  collectKey() {
    if (this.keyCollected) return;
    this.keyCollected = true;
    this.key.visible = false;
    this.audio.pickup();
    this.ui.showCaption('case2.key.caption');
    this.ui.addCasebookEntry('case2.key.entry');
    this.onStateChanged?.();

    setTimeout(() => {
      this.audio.caseClosed();
      this.ui.showCaption('case2.closed.caption');
      this.ui.addCasebookEntry('case2.closed.entry');
      this.onStateChanged?.();
    }, 2200);
  }

  update(dt) {
    this.elapsed += dt;
    this.hornGlow.setActive(!this.hornHeard);
    this.dialGlow.setActive(!this.solved);
    this.keyGlow.setActive(this.solved && !this.keyCollected);
    this.hornGlow.update(dt, this.elapsed);
    this.dialGlow.update(dt, this.elapsed);
    this.keyGlow.update(dt, this.elapsed);

    if (this.dialTweenT < 1) {
      this.dialTweenT = Math.min(1, this.dialTweenT + dt / DIAL_TWEEN_DURATION);
      const e = easeOutCubic(this.dialTweenT);
      this.needleGroup.rotation.y = this.dialFromAngle + (this.dialToAngle - this.dialFromAngle) * e;
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
      this.key.position.y = 0.06 + Math.sin(performance.now() * 0.0025) * 0.01;
      this.key.rotation.x += dt * 0.6;
    }
  }
}
