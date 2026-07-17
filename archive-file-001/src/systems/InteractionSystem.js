import * as THREE from 'three';

const MAX_DISTANCE = 2.6;

/**
 * Raycasts from the screen centre against a flat list of interactable
 * root objects (each already tagged via userData.interactable). This is
 * the entirety of the game's interaction model (GDD §14) — no physics,
 * no separate hitboxes, one predictable rule for every object.
 */
export class InteractionSystem {
  #raycaster = new THREE.Raycaster();
  #center = new THREE.Vector2(0, 0);
  #objects = [];
  #hovered = null;

  constructor({ camera, onHoverChange }) {
    this.camera = camera;
    this.onHoverChange = onHoverChange;
  }

  register(object) {
    this.#objects.push(object);
  }

  update() {
    this.#raycaster.near = 0.05;
    this.#raycaster.far = MAX_DISTANCE;
    this.#raycaster.setFromCamera(this.#center, this.camera);
    const hits = this.#raycaster.intersectObjects(this.#objects, true);

    let target = null;
    for (const hit of hits) {
      let node = hit.object;
      while (node && !node.userData?.interactable) node = node.parent;
      if (node) { target = node; break; }
    }

    if (target !== this.#hovered) {
      this.#hovered = target;
      this.onHoverChange?.(target);
    }
  }

  get hovered() {
    return this.#hovered;
  }

  interact() {
    if (!this.#hovered) return false;
    this.#hovered.userData.onInteract?.(this.#hovered);
    return true;
  }
}
