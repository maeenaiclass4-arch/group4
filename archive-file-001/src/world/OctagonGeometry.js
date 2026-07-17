import * as THREE from 'three';
import { octagonVertices } from './LevelLayout.js';

/**
 * Horizontal octagon meshes built directly from world-space (x,0,z)
 * positions rather than a CircleGeometry rotated into place — chaining
 * rotation.x then rotation.y on a mesh is NOT a simple "tilt flat, then
 * spin" (Euler axes aren't independent like that), which silently tilted
 * the floor/ceiling out of plane. Building the vertices explicitly sidesteps
 * that class of bug entirely and guarantees exact alignment with the wall
 * segments, which are generated from the same ROTUNDA_VERTICES.
 */
export function makeOctagonFloor(radius, repeat = 1) {
  const verts = octagonVertices(radius);
  const positions = [0, 0, 0];
  const uvs = [0.5, 0.5];
  for (const v of verts) {
    positions.push(v.x, 0, v.z);
    uvs.push(0.5 + (v.x / radius / 2) * repeat, 0.5 + (v.z / radius / 2) * repeat);
  }
  const indices = [];
  for (let i = 1; i <= verts.length; i++) {
    const next = (i % verts.length) + 1;
    indices.push(0, next, i);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** An octagonal annulus (for the Rotunda ceiling's lantern opening). */
export function makeOctagonAnnulus(innerRadius, outerRadius) {
  const inner = octagonVertices(innerRadius);
  const outer = octagonVertices(outerRadius);
  const positions = [];
  const uvs = [];
  for (let i = 0; i < 8; i++) {
    positions.push(inner[i].x, 0, inner[i].z);
    uvs.push(0, i / 8);
    positions.push(outer[i].x, 0, outer[i].z);
    uvs.push(1, i / 8);
  }
  const indices = [];
  for (let i = 0; i < 8; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = ((i + 1) % 8) * 2;
    const d = ((i + 1) % 8) * 2 + 1;
    // Normal faces -Y — this is the ceiling's underside, seen from below.
    indices.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
