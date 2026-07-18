import * as THREE from 'three';
import {
  LIGHT_CORRIDOR_START_X,
  LIGHT_CORRIDOR_END_X,
  CORRIDOR_WIDTH,
  LIGHT_CORRIDOR_HEIGHT,
  LIGHT_ROOM_NEAR_X,
  LIGHT_ROOM_FAR_X,
  LIGHT_ROOM_HALF_WIDTH,
  LIGHT_ROOM_HEIGHT,
} from './LevelLayout.js';
import { createDustMotes } from './DustMotes.js';
import { addInteractProxy } from './InteractProxy.js';

/**
 * Case 003 — Light Archive (Conservatory). Same corridor+room shape again,
 * this time along +X (the east gate), glass/iron/marble instead of the
 * Registry Wing's wood or the Audio Wing's brick — GDD: "glass, mirrors,
 * reading tables positioned for daylight."
 */

function buildMark(materials) {
  const group = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 20), materials.brassDull);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.011;
  group.add(rim);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), materials.glassFrosted);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.012;
  group.add(disc);
  return group;
}

/** The lens that cycles through rotations (the chair/dial's counterpart). */
function buildLens(materials) {
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.1, 12), materials.brassDull);
  post.position.y = 0.55;
  group.add(post);
  const yoke = new THREE.Group();
  yoke.position.y = 1.12;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.014, 8, 20), materials.brass);
  ring.rotation.x = Math.PI / 2;
  yoke.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), materials.glassFrosted);
  yoke.add(lens);
  group.add(yoke);
  return { group, yoke };
}

function buildCompartment(materials) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), materials.brassDull);
  frame.position.y = 0.005;
  group.add(frame);
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.34), materials.woodPanel);
  hatch.position.set(0, 0.015, 0);
  hatch.castShadow = true;
  group.add(hatch);
  const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.3), materials.ink);
  cavity.position.set(0, -0.1, 0);
  group.add(cavity);
  return { group, hatch };
}

function buildGlassToken(materials) {
  const group = new THREE.Group();
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), materials.glassFrosted);
  group.add(gem);
  return group;
}

export function buildLightWing({ materials, collisionWorld }) {
  const group = new THREE.Group();
  const halfW = CORRIDOR_WIDTH / 2;

  // corridor
  const corridorLen = LIGHT_CORRIDOR_END_X - LIGHT_CORRIDOR_START_X;
  const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(corridorLen, CORRIDOR_WIDTH), materials.conservatoryFloor);
  corridorFloor.rotation.x = -Math.PI / 2;
  corridorFloor.position.set((LIGHT_CORRIDOR_START_X + LIGHT_CORRIDOR_END_X) / 2, 0, 0);
  corridorFloor.receiveShadow = true;
  group.add(corridorFloor);

  const corridorCeil = corridorFloor.clone();
  corridorCeil.material = materials.ceiling;
  corridorCeil.rotation.x = Math.PI / 2;
  corridorCeil.position.y = LIGHT_CORRIDOR_HEIGHT;
  group.add(corridorCeil);

  const corridorWallGeo = new THREE.BoxGeometry(corridorLen, LIGHT_CORRIDOR_HEIGHT, 0.2);
  const nearWall = new THREE.Mesh(corridorWallGeo, materials.plaster);
  nearWall.position.set((LIGHT_CORRIDOR_START_X + LIGHT_CORRIDOR_END_X) / 2, LIGHT_CORRIDOR_HEIGHT / 2, -halfW);
  nearWall.receiveShadow = true;
  group.add(nearWall);
  const farWallSide = nearWall.clone();
  farWallSide.position.z = halfW;
  group.add(farWallSide);
  collisionWorld.addSegment(LIGHT_CORRIDOR_START_X, -halfW, LIGHT_CORRIDOR_END_X, -halfW);
  collisionWorld.addSegment(LIGHT_CORRIDOR_START_X, halfW, LIGHT_CORRIDOR_END_X, halfW);

  const sconceLight = new THREE.PointLight(0xeadcff, 16, 6.5, 1.8);
  sconceLight.position.set((LIGHT_CORRIDOR_START_X + LIGHT_CORRIDOR_END_X) / 2, LIGHT_CORRIDOR_HEIGHT - 0.3, 0);
  group.add(sconceLight);

  // conservatory room
  const roomWidth = LIGHT_ROOM_HALF_WIDTH * 2;
  const roomDepth = LIGHT_ROOM_FAR_X - LIGHT_ROOM_NEAR_X;
  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomWidth), materials.conservatoryFloor);
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.set((LIGHT_ROOM_NEAR_X + LIGHT_ROOM_FAR_X) / 2, 0, 0);
  roomFloor.receiveShadow = true;
  group.add(roomFloor);

  // Glass roof instead of a solid ceiling — the room's defining feature
  // (GDD: "full of skylights"). MeshPhysicalMaterial transmission is
  // already in the material library (glassFrosted), so this costs nothing
  // new in the pipeline.
  const roofGlass = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomWidth), materials.glassFrosted);
  roofGlass.rotation.x = Math.PI / 2;
  roofGlass.position.set((LIGHT_ROOM_NEAR_X + LIGHT_ROOM_FAR_X) / 2, LIGHT_ROOM_HEIGHT, 0);
  group.add(roofGlass);

  const skyLight = new THREE.PointLight(0xfff6e0, 30, 12, 1.6);
  skyLight.position.set((LIGHT_ROOM_NEAR_X + LIGHT_ROOM_FAR_X) / 2, LIGHT_ROOM_HEIGHT - 0.3, 0);
  group.add(skyLight);

  // near wall (doorway from corridor) — two piers flanking the gap
  const pierLen = (roomWidth - CORRIDOR_WIDTH) / 2;
  for (const sign of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.2, LIGHT_ROOM_HEIGHT, pierLen), materials.plaster);
    const cz = sign * (CORRIDOR_WIDTH / 2 + pierLen / 2);
    pier.position.set(LIGHT_ROOM_NEAR_X, LIGHT_ROOM_HEIGHT / 2, cz);
    pier.receiveShadow = true;
    group.add(pier);
    const from = cz - (sign * pierLen) / 2;
    const to = cz + (sign * pierLen) / 2;
    collisionWorld.addSegment(LIGHT_ROOM_NEAR_X, from, LIGHT_ROOM_NEAR_X, to);
  }

  // far / north / south walls — iron-framed glazing bars standing in for
  // full glasswork (steel material reused, not a new one)
  const farWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, LIGHT_ROOM_HEIGHT, roomWidth), materials.steel);
  farWall.position.set(LIGHT_ROOM_FAR_X, LIGHT_ROOM_HEIGHT / 2, 0);
  farWall.receiveShadow = true;
  group.add(farWall);
  collisionWorld.addSegment(LIGHT_ROOM_FAR_X, -LIGHT_ROOM_HALF_WIDTH, LIGHT_ROOM_FAR_X, LIGHT_ROOM_HALF_WIDTH);

  const sideWallGeo = new THREE.BoxGeometry(roomDepth, LIGHT_ROOM_HEIGHT, 0.2);
  const southWall = new THREE.Mesh(sideWallGeo, materials.steel);
  southWall.position.set((LIGHT_ROOM_NEAR_X + LIGHT_ROOM_FAR_X) / 2, LIGHT_ROOM_HEIGHT / 2, LIGHT_ROOM_HALF_WIDTH);
  southWall.receiveShadow = true;
  group.add(southWall);
  collisionWorld.addSegment(LIGHT_ROOM_NEAR_X, LIGHT_ROOM_HALF_WIDTH, LIGHT_ROOM_FAR_X, LIGHT_ROOM_HALF_WIDTH);

  const northWall = southWall.clone();
  northWall.position.z = -LIGHT_ROOM_HALF_WIDTH;
  group.add(northWall);
  collisionWorld.addSegment(LIGHT_ROOM_NEAR_X, -LIGHT_ROOM_HALF_WIDTH, LIGHT_ROOM_FAR_X, -LIGHT_ROOM_HALF_WIDTH);

  // a reading table — set dressing establishing "conservatory" (GDD §11)
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.6), materials.woodPanel);
  table.position.set(LIGHT_ROOM_NEAR_X + 1.6, 0.7, -LIGHT_ROOM_HALF_WIDTH + 0.7);
  table.castShadow = true;
  group.add(table);
  const legGeo = new THREE.BoxGeometry(0.05, 0.7, 0.05);
  for (const [lx, lz] of [[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]]) {
    const leg = new THREE.Mesh(legGeo, materials.woodPanel);
    leg.position.set(table.position.x + lx, 0.35, table.position.z + lz);
    group.add(leg);
  }

  const markPos = { x: LIGHT_ROOM_NEAR_X + 1.1, z: 0.9 };
  const lensPos = { x: LIGHT_ROOM_FAR_X - 1.5, z: -0.5 };

  const mark = buildMark(materials);
  mark.position.set(markPos.x, 0, markPos.z);
  mark.userData.interactable = { type: 'mark' };
  addInteractProxy(mark, { size: [0.55, 0.4, 0.55], offset: [0, 0.15, 0] });
  group.add(mark);

  const { group: lens, yoke } = buildLens(materials);
  lens.position.set(lensPos.x, 0, lensPos.z);
  lens.userData.interactable = { type: 'lens' };
  addInteractProxy(lens, { size: [0.6, 1.3, 0.6], offset: [0, 0.55, 0] });
  group.add(lens);

  // The beam: a thin additive-blended box between the lens and the mark,
  // invisible until solved — the exact technique the Rotunda's skylight
  // shaft already uses, just opacity-driven by CaseThreeSystem instead of
  // being always-on.
  const dx = markPos.x - lensPos.x;
  const dz = markPos.z - lensPos.z;
  const beamLength = Math.hypot(dx, dz);
  const beamAngle = Math.atan2(dx, dz);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfff2d2,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, beamLength), beamMat);
  beam.position.set((markPos.x + lensPos.x) / 2, 1.12, (markPos.z + lensPos.z) / 2);
  beam.rotation.y = beamAngle;
  group.add(beam);

  const { group: compartmentGroup, hatch } = buildCompartment(materials);
  compartmentGroup.position.set(markPos.x + 0.7, 0.001, markPos.z - 0.7);
  compartmentGroup.userData.interactable = { type: 'compartment' };
  addInteractProxy(compartmentGroup, { size: [0.65, 0.5, 0.55], offset: [0, 0.2, 0] });
  group.add(compartmentGroup);

  const token = buildGlassToken(materials);
  token.position.set(markPos.x + 0.7, 0.06, markPos.z - 0.7);
  token.visible = false;
  token.userData.interactable = { type: 'token' };
  addInteractProxy(token, { size: [0.3, 0.3, 0.3] });
  group.add(token);

  const dust = createDustMotes({
    count: 30,
    bounds: {
      minX: LIGHT_ROOM_NEAR_X, maxX: LIGHT_ROOM_FAR_X,
      minY: 0.5, maxY: LIGHT_ROOM_HEIGHT - 0.3,
      minZ: -LIGHT_ROOM_HALF_WIDTH + 0.3, maxZ: LIGHT_ROOM_HALF_WIDTH - 0.3,
    },
    size: 0.035,
    speed: 0.05,
  });
  group.add(dust);

  return { group, mark, lens, yoke, beamMat, key: token, compartmentGroup, hatch, dustMotes: [dust] };
}
