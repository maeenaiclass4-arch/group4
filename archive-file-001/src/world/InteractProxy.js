import * as THREE from 'three';

let sharedInvisibleMaterial = null;

/**
 * An invisible, enlarged raycast target added as a child of an
 * interactable object. Three.js only raycasts against `visible` objects,
 * so "invisible" here means fully transparent (opacity 0) rather than
 * `visible = false` — the mesh still renders (as nothing) and is still a
 * valid ray target, which is the whole point: the player can aim
 * anywhere within this generous volume, not just the exact pixels of the
 * small visible mesh inside it, and still trigger the interaction.
 */
export function addInteractProxy(parent, { size, offset = [0, 0, 0] }) {
  if (!sharedInvisibleMaterial) {
    sharedInvisibleMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  }
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(...size), sharedInvisibleMaterial);
  proxy.position.set(...offset);
  parent.add(proxy);
  return proxy;
}
