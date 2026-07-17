import * as THREE from 'three';
import {
  CORRIDOR_START_Z,
  CORRIDOR_END_Z,
  CORRIDOR_WIDTH,
  CORRIDOR_HEIGHT,
  ROOM_NEAR_Z,
  ROOM_FAR_Z,
  ROOM_HALF_WIDTH,
  ROOM_HEIGHT,
  DESK_POSITION,
  CHAIR_SLOTS,
  CORKBOARD_POSITION,
  COMPARTMENT_POSITION,
} from './LevelLayout.js';
import { buildReferencePhotoTexture } from './ReferencePhoto.js';
import { createDustMotes } from './DustMotes.js';
import { tagFlicker } from './Flicker.js';
import { addInteractProxy } from './InteractProxy.js';

function buildDesk(materials) {
  const group = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.75), materials.woodPanel);
  top.position.y = 0.75;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const legGeo = new THREE.BoxGeometry(0.07, 0.75, 0.07);
  for (const [lx, lz] of [[-0.68, -0.32], [0.68, -0.32], [-0.68, 0.32], [0.68, 0.32]]) {
    const leg = new THREE.Mesh(legGeo, materials.woodPanel);
    leg.position.set(lx, 0.375, lz);
    leg.castShadow = true;
    group.add(leg);
  }

  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.6), materials.steel);
  drawer.position.set(0.45, 0.6, 0);
  group.add(drawer);
  const drawerPull = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12), materials.brass);
  drawerPull.position.set(0.45, 0.6, 0.31);
  drawerPull.rotation.x = Math.PI / 2;
  group.add(drawerPull);

  // banker's lamp — the desk's single motivated light source
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 14), materials.brass);
  lampBase.position.set(-0.55, 0.79, -0.2);
  group.add(lampBase);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8), materials.brass);
  lampArm.position.set(-0.55, 0.93, -0.2);
  lampArm.rotation.z = 0.35;
  group.add(lampArm);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.13, 16, 1, true), materials.darkGreen);
  lampShade.position.set(-0.62, 1.06, -0.2);
  lampShade.rotation.x = Math.PI;
  group.add(lampShade);
  // Not a shadow caster — see the matching comment in buildRotunda.js: a
  // real-time cube-map shadow per accent light is expensive on mobile GPUs
  // for a visual difference this light is too small/dim to show.
  const lampLight = new THREE.PointLight(0xffcf94, 32, 6.5, 1.8);
  lampLight.position.set(-0.62, 1.0, -0.2);
  tagFlicker(lampLight, { amount: 0.09, speed: 0.55 });
  group.add(lampLight);

  // a paper left mid-form, unfinished
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.42), materials.paperLined);
  paper.rotation.x = -Math.PI / 2;
  paper.position.set(0.05, 0.785, 0.05);
  paper.rotation.z = 0.1;
  group.add(paper);

  return group;
}

function buildChair(materials) {
  const group = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.44), materials.darkGreen);
  seat.position.y = 0.46;
  seat.castShadow = true;
  group.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.05), materials.darkGreen);
  back.position.set(0, 0.71, -0.2);
  back.castShadow = true;
  group.add(back);
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.46, 6);
  for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
    const leg = new THREE.Mesh(legGeo, materials.brassDull);
    leg.position.set(lx, 0.23, lz);
    group.add(leg);
  }
  return group;
}

function buildCorkboard(materials) {
  const group = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 1.1), materials.leather);
  group.add(board);

  const photoTex = buildReferencePhotoTexture();
  const photoMat = new THREE.MeshStandardMaterial({ map: photoTex, roughness: 0.7 });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), photoMat);
  photo.rotation.y = Math.PI / 2;
  photo.rotation.z = -0.06;
  photo.position.set(0.031, 0.1, -0.05);
  group.add(photo);

  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), materials.brass);
  pin.position.set(0.045, 0.29, -0.05);
  group.add(pin);

  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.18), materials.paperLined);
  note.rotation.y = Math.PI / 2;
  note.rotation.z = 0.08;
  note.position.set(0.03, -0.22, 0.18);
  group.add(note);

  // A small brass reading-light above the board, purely decorative — its
  // actual illumination comes from the case room's fill light (see
  // buildRegistryWing) rather than its own point light, since a light
  // mounted this close to a flat surface blows the surface out to white
  // long before it reaches the photo a few centimetres below it.
  const sconceArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), materials.brass);
  sconceArm.position.set(0.09, 0.66, -0.05);
  sconceArm.rotation.z = Math.PI / 2.2;
  group.add(sconceArm);
  const sconceShade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.1, 14, 1, true), materials.darkGreen);
  sconceShade.position.set(0.15, 0.6, -0.05);
  sconceShade.rotation.x = Math.PI;
  sconceShade.rotation.z = 0.6;
  group.add(sconceShade);

  return group;
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

function buildKey(materials) {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8), materials.brass);
  shaft.rotation.z = Math.PI / 2;
  group.add(shaft);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 16), materials.brass);
  bow.position.x = -0.05;
  bow.rotation.y = Math.PI / 2;
  group.add(bow);
  const bit = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.008), materials.brass);
  bit.position.x = 0.05;
  group.add(bit);
  return group;
}

export function buildRegistryWing({ materials, collisionWorld }) {
  const group = new THREE.Group();
  const halfW = CORRIDOR_WIDTH / 2;

  // corridor
  const corridorLen = CORRIDOR_START_Z - CORRIDOR_END_Z;
  const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_WIDTH, corridorLen), materials.floorPlank);
  corridorFloor.rotation.x = -Math.PI / 2;
  corridorFloor.position.set(0, 0, (CORRIDOR_START_Z + CORRIDOR_END_Z) / 2);
  corridorFloor.receiveShadow = true;
  group.add(corridorFloor);

  const corridorCeil = corridorFloor.clone();
  corridorCeil.material = materials.ceiling;
  corridorCeil.rotation.x = Math.PI / 2;
  corridorCeil.position.y = CORRIDOR_HEIGHT;
  group.add(corridorCeil);

  const corridorWallGeo = new THREE.BoxGeometry(0.2, CORRIDOR_HEIGHT, corridorLen);
  const leftWall = new THREE.Mesh(corridorWallGeo, materials.steel);
  leftWall.position.set(-halfW, CORRIDOR_HEIGHT / 2, (CORRIDOR_START_Z + CORRIDOR_END_Z) / 2);
  leftWall.receiveShadow = true;
  group.add(leftWall);
  const rightWall = leftWall.clone();
  rightWall.position.x = halfW;
  group.add(rightWall);
  collisionWorld.addSegment(-halfW, CORRIDOR_START_Z, -halfW, CORRIDOR_END_Z);
  collisionWorld.addSegment(halfW, CORRIDOR_START_Z, halfW, CORRIDOR_END_Z);

  const bulbFixture = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), materials.brassDull);
  bulbFixture.position.set(0, CORRIDOR_HEIGHT - 0.3, (CORRIDOR_START_Z + CORRIDOR_END_Z) / 2);
  group.add(bulbFixture);
  const bulbLight = new THREE.PointLight(0xffcf94, 24, 7, 1.8);
  bulbLight.position.copy(bulbFixture.position);
  tagFlicker(bulbLight, { amount: 0.11, speed: 0.5 });
  group.add(bulbLight);

  // case room
  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_HALF_WIDTH * 2, ROOM_NEAR_Z - ROOM_FAR_Z), materials.floorPlank);
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.set(0, 0, (ROOM_NEAR_Z + ROOM_FAR_Z) / 2);
  roomFloor.receiveShadow = true;
  group.add(roomFloor);

  const roomCeil = roomFloor.clone();
  roomCeil.material = materials.ceiling;
  roomCeil.rotation.x = Math.PI / 2;
  roomCeil.position.y = ROOM_HEIGHT;
  group.add(roomCeil);

  // south wall (doorway from corridor) — two piers
  const pierLen = (ROOM_HALF_WIDTH * 2 - CORRIDOR_WIDTH) / 2;
  for (const sign of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pierLen, ROOM_HEIGHT, 0.2), materials.plaster);
    const cx = sign * (CORRIDOR_WIDTH / 2 + pierLen / 2);
    pier.position.set(cx, ROOM_HEIGHT / 2, ROOM_NEAR_Z);
    pier.receiveShadow = true;
    group.add(pier);
    const from = cx - (sign * pierLen) / 2;
    const to = cx + (sign * pierLen) / 2;
    collisionWorld.addSegment(from, ROOM_NEAR_Z, to, ROOM_NEAR_Z);
  }

  // far / east / west walls
  const farWall = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF_WIDTH * 2, ROOM_HEIGHT, 0.2), materials.plaster);
  farWall.position.set(0, ROOM_HEIGHT / 2, ROOM_FAR_Z);
  farWall.receiveShadow = true;
  group.add(farWall);
  collisionWorld.addSegment(-ROOM_HALF_WIDTH, ROOM_FAR_Z, ROOM_HALF_WIDTH, ROOM_FAR_Z);

  const sideWallGeo = new THREE.BoxGeometry(0.2, ROOM_HEIGHT, ROOM_NEAR_Z - ROOM_FAR_Z);
  const eastWall = new THREE.Mesh(sideWallGeo, materials.plaster);
  eastWall.position.set(ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, (ROOM_NEAR_Z + ROOM_FAR_Z) / 2);
  eastWall.receiveShadow = true;
  group.add(eastWall);
  collisionWorld.addSegment(ROOM_HALF_WIDTH, ROOM_NEAR_Z, ROOM_HALF_WIDTH, ROOM_FAR_Z);

  const westWall = eastWall.clone();
  westWall.position.x = -ROOM_HALF_WIDTH;
  group.add(westWall);
  collisionWorld.addSegment(-ROOM_HALF_WIDTH, ROOM_NEAR_Z, -ROOM_HALF_WIDTH, ROOM_FAR_Z);

  // shelving on the east wall — set dressing, GDD §11 material language
  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 1.6), materials.steel);
    shelf.position.set(ROOM_HALF_WIDTH - 0.2, 0.6 + i * 0.55, ROOM_NEAR_Z - 1.6);
    group.add(shelf);
    for (let f = 0; f < 5; f++) {
      const folder = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.18), materials.paper);
      folder.position.set(ROOM_HALF_WIDTH - 0.28 + f * 0.06, 0.6 + i * 0.55 + 0.14, ROOM_NEAR_Z - 2.2 + f * 0.2);
      folder.rotation.y = 0.05 * f;
      group.add(folder);
    }
  }

  // Room fill light: a soft, wide-reaching source mounted at ceiling height
  // in the room's centre, standing in for bounce light off the desk lamp
  // and corridor bulb. Keeps every corner of the case room legible (GDD
  // pillar 1) without any single fixture hotspotting a nearby surface.
  const fillLight = new THREE.PointLight(0xd8c8a8, 16, 9, 1.6);
  fillLight.position.set(0, ROOM_HEIGHT - 0.3, (ROOM_NEAR_Z + ROOM_FAR_Z) / 2);
  group.add(fillLight);

  // desk + chair + lamp
  const desk = buildDesk(materials);
  desk.position.set(DESK_POSITION.x, 0, DESK_POSITION.z);
  desk.rotation.y = Math.PI;
  group.add(desk);
  // Static footprint collision — the desk never moves and never should be
  // walked through, but it's also never meant to react like a physics body
  // (no pushback/knockback), so this is exactly the same fixed-segment
  // technique the walls use, not a rigid body.
  collisionWorld.addBox(DESK_POSITION.x - 0.75, DESK_POSITION.x + 0.75, DESK_POSITION.z - 0.375, DESK_POSITION.z + 0.375);

  // Every interactable gets a generously oversized invisible hit volume
  // (InteractProxy.js) as a child — aiming anywhere near the object works,
  // not just the exact visible pixels of its (often small) mesh.
  const chair = buildChair(materials);
  const slot0 = CHAIR_SLOTS[0];
  chair.position.set(slot0.x, 0, slot0.z);
  chair.rotation.y = slot0.ry;
  chair.userData.interactable = { type: 'chair' };
  addInteractProxy(chair, { size: [0.8, 1.15, 0.8], offset: [0, 0.5, 0] });
  group.add(chair);

  const corkboard = buildCorkboard(materials);
  corkboard.position.set(CORKBOARD_POSITION.x, 1.15, CORKBOARD_POSITION.z);
  corkboard.userData.interactable = { type: 'photo' };
  addInteractProxy(corkboard, { size: [0.7, 1.1, 1.3], offset: [0.25, 0, 0] });
  group.add(corkboard);

  const { group: compartmentGroup, hatch } = buildCompartment(materials);
  compartmentGroup.position.set(COMPARTMENT_POSITION.x, 0.001, COMPARTMENT_POSITION.z);
  compartmentGroup.userData.interactable = { type: 'compartment' };
  addInteractProxy(compartmentGroup, { size: [0.65, 0.5, 0.55], offset: [0, 0.2, 0] });
  group.add(compartmentGroup);

  const key = buildKey(materials);
  key.position.set(COMPARTMENT_POSITION.x, 0.05, COMPARTMENT_POSITION.z);
  key.visible = false;
  key.userData.interactable = { type: 'key' };
  addInteractProxy(key, { size: [0.32, 0.32, 0.32] });
  group.add(key);

  // Dust catching the banker's lamp and the corridor bulb — the only two
  // strong point sources in this wing, so the only two places motes would
  // actually be visible.
  const deskDust = createDustMotes({
    count: 26,
    bounds: {
      minX: DESK_POSITION.x - 0.75, maxX: DESK_POSITION.x + 0.15,
      minY: 0.75, maxY: 1.35,
      minZ: DESK_POSITION.z - 0.4, maxZ: DESK_POSITION.z + 0.2,
    },
    size: 0.03,
    speed: 0.07,
  });
  group.add(deskDust);

  const corridorDust = createDustMotes({
    count: 20,
    bounds: {
      minX: -halfW + 0.2, maxX: halfW - 0.2,
      minY: CORRIDOR_HEIGHT - 0.9, maxY: CORRIDOR_HEIGHT - 0.35,
      minZ: (CORRIDOR_START_Z + CORRIDOR_END_Z) / 2 - 1.2, maxZ: (CORRIDOR_START_Z + CORRIDOR_END_Z) / 2 + 1.2,
    },
    size: 0.03,
    speed: 0.06,
  });
  group.add(corridorDust);

  return { group, chair, hatch, key, compartmentGroup, corkboard, dustMotes: [deskDust, corridorDust] };
}
