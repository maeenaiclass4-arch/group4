import * as THREE from 'three';

const EYE_HEIGHT = 1.68;
const RADIUS = 0.32;
const SPEED = 2.6;
const LOOK_SENSITIVITY = 0.0022;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const FOOTSTEP_INTERVAL = 0.46;

export class PlayerController {
  yaw = Math.PI;
  pitch = 0;

  constructor({ camera, input, collisionWorld, onFootstep }) {
    this.camera = camera;
    this.input = input;
    this.collisionWorld = collisionWorld;
    this.onFootstep = onFootstep;
    this.position = new THREE.Vector3(0, EYE_HEIGHT, 8.6);
    this.#stepClock = 0;
  }

  #stepClock;

  setPose({ x, y, z, yaw, pitch }) {
    this.position.set(x, y ?? EYE_HEIGHT, z);
    this.yaw = yaw ?? this.yaw;
    this.pitch = pitch ?? this.pitch;
  }

  getPose() {
    return { x: this.position.x, y: this.position.y, z: this.position.z, yaw: this.yaw, pitch: this.pitch };
  }

  update(dt) {
    const { x: dx, y: dy } = this.input.consumeLookDelta();
    this.yaw -= dx * LOOK_SENSITIVITY;
    this.pitch -= dy * LOOK_SENSITIVITY;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));

    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);

    let moveX = 0;
    let moveZ = 0;
    if (this.input.isDown('KeyW', 'ArrowUp')) { moveX += forward.x; moveZ += forward.z; }
    if (this.input.isDown('KeyS', 'ArrowDown')) { moveX -= forward.x; moveZ -= forward.z; }
    if (this.input.isDown('KeyD', 'ArrowRight')) { moveX += right.x; moveZ += right.z; }
    if (this.input.isDown('KeyA', 'ArrowLeft')) { moveX -= right.x; moveZ -= right.z; }

    const moving = moveX !== 0 || moveZ !== 0;
    if (moving) {
      const len = Math.hypot(moveX, moveZ) || 1;
      const speed = SPEED * (this.input.isDown('ShiftLeft', 'ShiftRight') ? 1.35 : 1);
      moveX = (moveX / len) * speed * dt;
      moveZ = (moveZ / len) * speed * dt;

      const resolved = this.collisionWorld.resolve(this.position.x + moveX, this.position.z + moveZ, RADIUS);
      this.position.x = resolved.x;
      this.position.z = resolved.z;

      this.#stepClock += dt;
      if (this.#stepClock >= FOOTSTEP_INTERVAL) {
        this.#stepClock = 0;
        this.onFootstep?.();
      }
      this.position.y = EYE_HEIGHT + Math.sin(performance.now() * 0.006) * 0.012;
    } else {
      this.#stepClock = FOOTSTEP_INTERVAL * 0.4;
      this.position.y += (EYE_HEIGHT - this.position.y) * 0.1;
    }

    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }
}
