import * as THREE from 'three';
import {
  AUDIO_CORRIDOR_START_X,
  AUDIO_CORRIDOR_END_X,
  CORRIDOR_WIDTH,
  AUDIO_CORRIDOR_HEIGHT,
  AUDIO_ROOM_NEAR_X,
  AUDIO_ROOM_FAR_X,
  AUDIO_ROOM_HALF_WIDTH,
  AUDIO_ROOM_HEIGHT,
} from './LevelLayout.js';
import { createDustMotes } from './DustMotes.js';
import { tagFlicker } from './Flicker.js';
import { addInteractProxy } from './InteractProxy.js';

/**
 * Case 002 — Audio Archive (Substrata / Sound Vaults). Same corridor+room
 * shape as the Registry Wing, rotated 90° into the X axis (the west gate
 * instead of the north one) and re-skinned in brick — a shorter, single-room
 * wing by design (GDD §19: "targets, not commitments"; this is the same
 * vertical-showcase scope as Case 001, not a full wing).
 */

function buildPipeManifold(materials) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.9), materials.steel);
  frame.position.y = 0.9;
  group.add(frame);

  const valveGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12);
  for (let i = 0; i < 3; i++) {
    const valve = new THREE.Mesh(valveGeo, materials.brassDull);
    valve.rotation.z = Math.PI / 2;
    valve.position.set(0.06, 0.5 + i * 0.42, -0.3 + i * 0.3);
    group.add(valve);
  }
  return group;
}

/** The dial that cycles through pitches (the chair's counterpart). Returns
 * the needleGroup separately since CaseTwoSystem rotates just that around
 * its own vertical axis to point at each state — the equivalent of the
 * chair tweening between CHAIR_SLOTS. */
function buildSelectorDial(materials) {
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 12), materials.steel);
  post.position.y = 0.45;
  group.add(post);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16), materials.brassDull);
  face.rotation.x = Math.PI / 2;
  face.position.y = 0.95;
  group.add(face);
  const needleGroup = new THREE.Group();
  needleGroup.position.y = 0.95;
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.13), materials.brass);
  needle.position.z = 0.08;
  needleGroup.add(needle);
  group.add(needleGroup);
  return { group, needleGroup };
}

/** The listening horn — always-available reference, the corkboard's counterpart. */
function buildHorn(materials) {
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), materials.brassDull);
  post.position.y = 0.25;
  group.add(post);
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 16, 1, true), materials.brass);
  horn.position.y = 0.62;
  horn.rotation.x = Math.PI / 2.4;
  group.add(horn);
  return group;
}

function buildCompartment(materials) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), materials.brassDull);
  frame.position.y = 0.005;
  group.add(frame);
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.34), materials.steel);
  hatch.position.set(0, 0.015, 0);
  hatch.castShadow = true;
  group.add(hatch);
  const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.3), materials.ink);
  cavity.position.set(0, -0.1, 0);
  group.add(cavity);
  return { group, hatch };
}

function buildSpindle(materials) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.09, 16), materials.brassDull);
  core.rotation.z = Math.PI / 2;
  group.add(core);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 8, 16), materials.brass);
  rim.rotation.y = Math.PI / 2;
  rim.position.x = 0.045;
  group.add(rim);
  return group;
}

export function buildAudioWing({ materials, collisionWorld }) {
  const group = new THREE.Group();
  const halfW = CORRIDOR_WIDTH / 2;

  // corridor
  const corridorLen = AUDIO_CORRIDOR_START_X - AUDIO_CORRIDOR_END_X;
  const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(corridorLen, CORRIDOR_WIDTH), materials.brick);
  corridorFloor.rotation.x = -Math.PI / 2;
  corridorFloor.position.set((AUDIO_CORRIDOR_START_X + AUDIO_CORRIDOR_END_X) / 2, 0, 0);
  corridorFloor.receiveShadow = true;
  group.add(corridorFloor);

  const corridorCeil = corridorFloor.clone();
  corridorCeil.material = materials.ceiling;
  corridorCeil.rotation.x = Math.PI / 2;
  corridorCeil.position.y = AUDIO_CORRIDOR_HEIGHT;
  group.add(corridorCeil);

  const corridorWallGeo = new THREE.BoxGeometry(corridorLen, AUDIO_CORRIDOR_HEIGHT, 0.2);
  const nearWall = new THREE.Mesh(corridorWallGeo, materials.brick);
  nearWall.position.set((AUDIO_CORRIDOR_START_X + AUDIO_CORRIDOR_END_X) / 2, AUDIO_CORRIDOR_HEIGHT / 2, -halfW);
  nearWall.receiveShadow = true;
  group.add(nearWall);
  const farWallSide = nearWall.clone();
  farWallSide.position.z = halfW;
  group.add(farWallSide);
  collisionWorld.addSegment(AUDIO_CORRIDOR_START_X, -halfW, AUDIO_CORRIDOR_END_X, -halfW);
  collisionWorld.addSegment(AUDIO_CORRIDOR_START_X, halfW, AUDIO_CORRIDOR_END_X, halfW);

  const bulbFixture = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), materials.brassDull);
  bulbFixture.position.set((AUDIO_CORRIDOR_START_X + AUDIO_CORRIDOR_END_X) / 2, AUDIO_CORRIDOR_HEIGHT - 0.3, 0);
  group.add(bulbFixture);
  // Not a shadow caster (see buildRotunda.js's matching comment) — accent
  // lights stay off the mobile shadow budget entirely.
  const bulbLight = new THREE.PointLight(0x9fc4dd, 20, 6.5, 1.8);
  bulbLight.position.copy(bulbFixture.position);
  tagFlicker(bulbLight, { amount: 0.09, speed: 0.45 });
  group.add(bulbLight);

  // vault room
  const roomWidth = AUDIO_ROOM_HALF_WIDTH * 2;
  const roomDepth = AUDIO_ROOM_NEAR_X - AUDIO_ROOM_FAR_X;
  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomWidth), materials.brick);
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.set((AUDIO_ROOM_NEAR_X + AUDIO_ROOM_FAR_X) / 2, 0, 0);
  roomFloor.receiveShadow = true;
  group.add(roomFloor);

  const roomCeil = roomFloor.clone();
  roomCeil.material = materials.ceiling;
  roomCeil.rotation.x = Math.PI / 2;
  roomCeil.position.y = AUDIO_ROOM_HEIGHT;
  group.add(roomCeil);

  // near wall (doorway from corridor) — two piers flanking the gap
  const pierLen = (roomWidth - CORRIDOR_WIDTH) / 2;
  for (const sign of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.2, AUDIO_ROOM_HEIGHT, pierLen), materials.brick);
    const cz = sign * (CORRIDOR_WIDTH / 2 + pierLen / 2);
    pier.position.set(AUDIO_ROOM_NEAR_X, AUDIO_ROOM_HEIGHT / 2, cz);
    pier.receiveShadow = true;
    group.add(pier);
    const from = cz - (sign * pierLen) / 2;
    const to = cz + (sign * pierLen) / 2;
    collisionWorld.addSegment(AUDIO_ROOM_NEAR_X, from, AUDIO_ROOM_NEAR_X, to);
  }

  // far / north / south walls
  const farWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, AUDIO_ROOM_HEIGHT, roomWidth), materials.brick);
  farWall.position.set(AUDIO_ROOM_FAR_X, AUDIO_ROOM_HEIGHT / 2, 0);
  farWall.receiveShadow = true;
  group.add(farWall);
  collisionWorld.addSegment(AUDIO_ROOM_FAR_X, -AUDIO_ROOM_HALF_WIDTH, AUDIO_ROOM_FAR_X, AUDIO_ROOM_HALF_WIDTH);

  const sideWallGeo = new THREE.BoxGeometry(roomDepth, AUDIO_ROOM_HEIGHT, 0.2);
  const southWall = new THREE.Mesh(sideWallGeo, materials.brick);
  southWall.position.set((AUDIO_ROOM_NEAR_X + AUDIO_ROOM_FAR_X) / 2, AUDIO_ROOM_HEIGHT / 2, AUDIO_ROOM_HALF_WIDTH);
  southWall.receiveShadow = true;
  group.add(southWall);
  collisionWorld.addSegment(AUDIO_ROOM_NEAR_X, AUDIO_ROOM_HALF_WIDTH, AUDIO_ROOM_FAR_X, AUDIO_ROOM_HALF_WIDTH);

  const northWall = southWall.clone();
  northWall.position.z = -AUDIO_ROOM_HALF_WIDTH;
  group.add(northWall);
  collisionWorld.addSegment(AUDIO_ROOM_NEAR_X, -AUDIO_ROOM_HALF_WIDTH, AUDIO_ROOM_FAR_X, -AUDIO_ROOM_HALF_WIDTH);

  // exposed conduit — set dressing establishing "vault", GDD §11 material language
  for (let i = 0; i < 2; i++) {
    const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, roomDepth * 0.7, 8), materials.steel);
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set((AUDIO_ROOM_NEAR_X + AUDIO_ROOM_FAR_X) / 2, AUDIO_ROOM_HEIGHT - 0.35 - i * 0.3, -AUDIO_ROOM_HALF_WIDTH + 0.25);
    group.add(conduit);
  }

  const fillLight = new THREE.PointLight(0x8fa8c0, 14, 9, 1.6);
  fillLight.position.set((AUDIO_ROOM_NEAR_X + AUDIO_ROOM_FAR_X) / 2, AUDIO_ROOM_HEIGHT - 0.3, 0);
  group.add(fillLight);

  const manifoldX = AUDIO_ROOM_FAR_X + 1.4;

  // pipe manifold — decorative backdrop for the dial, three visible valves
  const manifold = buildPipeManifold(materials);
  manifold.position.set(manifoldX, 0, -1);
  group.add(manifold);

  // Every interactable gets a generously oversized invisible hit volume
  // (InteractProxy.js), same as every other case.
  const horn = buildHorn(materials);
  horn.position.set(AUDIO_ROOM_NEAR_X - 1, 0, AUDIO_ROOM_HALF_WIDTH - 0.6);
  horn.userData.interactable = { type: 'horn' };
  addInteractProxy(horn, { size: [0.6, 0.9, 0.6], offset: [0, 0.4, 0] });
  group.add(horn);

  const { group: dial, needleGroup } = buildSelectorDial(materials);
  dial.position.set(manifoldX + 0.6, 0, 0.6);
  dial.userData.interactable = { type: 'dial' };
  addInteractProxy(dial, { size: [0.6, 1.15, 0.6], offset: [0, 0.5, 0] });
  group.add(dial);

  const { group: compartmentGroup, hatch } = buildCompartment(materials);
  compartmentGroup.position.set(manifoldX + 0.6, 0.001, -0.6);
  compartmentGroup.userData.interactable = { type: 'compartment' };
  addInteractProxy(compartmentGroup, { size: [0.65, 0.5, 0.55], offset: [0, 0.2, 0] });
  group.add(compartmentGroup);

  const spindle = buildSpindle(materials);
  spindle.position.set(manifoldX + 0.6, 0.06, -0.6);
  spindle.visible = false;
  spindle.userData.interactable = { type: 'spindle' };
  addInteractProxy(spindle, { size: [0.32, 0.32, 0.32] });
  group.add(spindle);

  const vaultDust = createDustMotes({
    count: 24,
    bounds: {
      minX: AUDIO_ROOM_FAR_X, maxX: AUDIO_ROOM_FAR_X + 2.2,
      minY: 0.4, maxY: AUDIO_ROOM_HEIGHT - 0.4,
      minZ: -AUDIO_ROOM_HALF_WIDTH + 0.3, maxZ: AUDIO_ROOM_HALF_WIDTH - 0.3,
    },
    size: 0.03,
    speed: 0.06,
  });
  group.add(vaultDust);

  return { group, horn, dial, needleGroup, key: spindle, compartmentGroup, hatch, dustMotes: [vaultDust] };
}
