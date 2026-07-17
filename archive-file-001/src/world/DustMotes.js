import * as THREE from 'three';

/**
 * Slow-drifting dust motes, concentrated inside a given volume. Pure
 * atmosphere — GDD §11's "dust and fog as light-definition tools" — built
 * from a procedural point sprite, no external texture.
 */
function softDotTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,244,222,0.9)');
  g.addColorStop(0.4, 'rgba(255,230,190,0.35)');
  g.addColorStop(1, 'rgba(255,230,190,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

let sharedTexture = null;

export function createDustMotes({ count, bounds, size = 0.05, speed = 0.06 }) {
  if (!sharedTexture) sharedTexture = softDotTexture();

  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    positions[i * 3 + 1] = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    positions[i * 3 + 2] = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
    seeds[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size,
    map: sharedTexture,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, material);
  points.userData.isDustMotes = true;

  const basePositions = positions.slice();

  points.userData.update = (t) => {
    const pos = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];
      pos.array[i * 3] = bx + Math.sin(t * speed + s) * 0.35;
      pos.array[i * 3 + 1] = by + Math.sin(t * speed * 0.6 + s * 1.7) * 0.25;
      pos.array[i * 3 + 2] = bz + Math.cos(t * speed * 0.8 + s) * 0.35;
    }
    pos.needsUpdate = true;
  };

  return points;
}
