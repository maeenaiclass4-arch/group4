import * as THREE from 'three';
import { ROTUNDA_HEIGHT, ROTUNDA_LANTERN_HEIGHT } from './LevelLayout.js';

const DURATION = 4.5;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * The closing beat once all three cases are solved: a brief cutaway rising
 * toward the Rotunda skylight to look down across the whole octagonal hall
 * — every gate visible at once, including the two the player just opened —
 * then a hard cut back to wherever the player actually is. Deliberately
 * not a continuous shot from the player's real position (they could be
 * anywhere in any of the three wings when the last key is collected); GDD
 * §2.1 already establishes the Archive as something the player shouldn't
 * fully trust their own read of, so an unexplained "vision" cutaway fits
 * the tone rather than fighting it. Mirrors IntroPan's lerp/slerp shape.
 */
export class OutroPan {
  #active = false;
  #t = 0;
  #startPos = new THREE.Vector3();
  #startQuat = new THREE.Quaternion();
  #endPos = new THREE.Vector3();
  #endQuat = new THREE.Quaternion();

  get active() {
    return this.#active;
  }

  start(camera) {
    this.#active = true;
    this.#t = 0;

    this.#startPos.set(0, 1.7, 5.2);
    const startCam = camera.clone();
    startCam.position.copy(this.#startPos);
    startCam.up.set(0, 1, 0);
    startCam.lookAt(new THREE.Vector3(0, 1.4, 0));
    this.#startQuat.copy(startCam.quaternion);

    this.#endPos.set(0.2, ROTUNDA_HEIGHT + ROTUNDA_LANTERN_HEIGHT - 0.9, 0.2);
    const endCam = camera.clone();
    endCam.position.copy(this.#endPos);
    endCam.up.set(0, 0, -1); // looking near-straight down — a regular "up" breaks lookAt at the pole
    endCam.lookAt(new THREE.Vector3(0, 0, 0));
    this.#endQuat.copy(endCam.quaternion);

    camera.position.copy(this.#startPos);
    camera.quaternion.copy(this.#startQuat);
  }

  update(camera, dt) {
    if (!this.#active) return;
    this.#t += dt;
    const frac = Math.min(1, this.#t / DURATION);
    const eased = easeInOutCubic(frac);

    camera.position.lerpVectors(this.#startPos, this.#endPos, eased);
    camera.quaternion.slerpQuaternions(this.#startQuat, this.#endQuat, eased);

    if (frac >= 1) this.#active = false;
  }
}
