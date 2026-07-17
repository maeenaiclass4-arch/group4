import * as THREE from 'three';

const DURATION = 2.4;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * A single, one-time establishing shot played the first time the player
 * steps into the Rotunda each session: the camera starts high and slightly
 * back, looking down toward the intake desk, then settles into the
 * player's actual eye-level spawn transform. Pure camera presentation —
 * it never touches player state, so control handoff afterward is exact.
 */
export class IntroPan {
  #active = false;
  #t = 0;
  #startPos = new THREE.Vector3();
  #startQuat = new THREE.Quaternion();
  #endPos = new THREE.Vector3();
  #endQuat = new THREE.Quaternion();

  get active() {
    return this.#active;
  }

  start(camera, spawnPos) {
    this.#active = true;
    this.#t = 0;

    this.#endPos.copy(camera.position);
    this.#endQuat.copy(camera.quaternion);

    // A fixed vantage tuned for the Rotunda specifically (this pan only
    // ever plays here — see main.js's isFreshSession gate): up under the
    // skylight, pulled toward the room's open centre rather than back
    // toward spawn, which sits close enough to the south wall that any
    // "further back" offset pushes the camera outside the building.
    this.#startPos.set(spawnPos.x + 2.1, spawnPos.y + 2.6, spawnPos.z - 5.6);
    const lookTarget = new THREE.Vector3(spawnPos.x - 0.2, 0.7, spawnPos.z - 0.6);
    const startCam = camera.clone();
    startCam.position.copy(this.#startPos);
    startCam.up.set(0, 1, 0);
    startCam.lookAt(lookTarget);
    this.#startQuat.copy(startCam.quaternion);

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
