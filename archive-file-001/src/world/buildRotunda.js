import * as THREE from 'three';
import {
  ROTUNDA_VERTICES,
  ROTUNDA_EDGES,
  ROTUNDA_RADIUS,
  ROTUNDA_HEIGHT,
  ROTUNDA_LANTERN_HEIGHT,
  GATE_WIDTH,
  GATE_HEIGHT,
} from './LevelLayout.js';
import { makeOctagonFloor, makeOctagonAnnulus } from './OctagonGeometry.js';

function edgeGeometry(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dz);
  const ux = dx / length;
  const uz = dz / length;
  // A box's local +X axis, rotated by rotation.y=angle, lands at world
  // (cos(angle), -sin(angle)) — so to align it with the unit tangent
  // (ux, uz), angle = atan2(-uz, ux). (Verified against every edge by hand;
  // the previous atan2(dx, dz) formula rendered every wall panel edge-on.)
  const angle = Math.atan2(-uz, ux);
  const midX = (a.x + b.x) / 2;
  const midZ = (a.z + b.z) / 2;
  return { length, angle, midX, midZ, dx: ux, dz: uz };
}

function makeWallPanel(length, height, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.3), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A shallow niche with a crossed-brass grate — a locked wing, glimpsed but never entered (GDD §2). */
function buildLockedGate(materials, width, height) {
  const group = new THREE.Group();

  const recess = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.6),
    materials.ink,
  );
  recess.position.set(0, height / 2, -0.28);
  group.add(recess);

  const glow = new THREE.PointLight(0xffb066, 9, 3.6, 1.8);
  glow.position.set(0, 0.4, -0.5);
  group.add(glow);

  const barCount = 5;
  for (let i = 0; i < barCount; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, height * 0.92, 0.05), materials.brassDull);
    bar.position.set(-width / 2 + ((i + 0.5) * width) / barCount, height / 2, 0.02);
    bar.castShadow = true;
    group.add(bar);
  }
  const crossBar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, 0.05, 0.05), materials.brassDull);
  crossBar.position.set(0, height * 0.6, 0.02);
  group.add(crossBar);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.06, 0.15), materials.brass);
  sill.position.set(0, 0.03, 0.05);
  group.add(sill);

  return group;
}

function buildMemorialWall(materials, length, height) {
  const group = new THREE.Group();
  const rows = 4;
  const cols = 7;
  const plateW = 0.32;
  const plateH = 0.14;
  const startX = -((cols - 1) * (plateW + 0.12)) / 2;
  const startY = height * 0.42;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(plateW, plateH, 0.02), materials.brassDull);
      plate.position.set(startX + c * (plateW + 0.12), startY - r * (plateH + 0.15), 0.16);
      plate.castShadow = true;
      group.add(plate);
    }
  }
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(length * 0.5, 0.06, 0.16), materials.woodPanel);
  shelf.position.set(0, height * 0.22, 0.18);
  group.add(shelf);
  return group;
}

function buildIntakeDesk(materials) {
  const group = new THREE.Group();
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.95, 0.8), materials.woodPanel);
  desk.position.set(0, 0.475, 0);
  desk.castShadow = true;
  desk.receiveShadow = true;
  group.add(desk);

  const ledger = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.36), materials.paperLined);
  ledger.position.set(-0.4, 0.98, 0);
  ledger.rotation.x = -0.05;
  group.add(ledger);

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.05, 12), materials.brass);
  lampBase.position.set(0.7, 0.98, 0);
  group.add(lampBase);
  const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 8), materials.brass);
  lampPost.position.set(0.7, 1.14, 0);
  group.add(lampPost);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.14, 16, 1, true), materials.darkGreen);
  lampShade.position.set(0.7, 1.32, 0);
  group.add(lampShade);
  const lampLight = new THREE.PointLight(0xffd9a0, 26, 6, 1.8);
  lampLight.position.set(0.7, 1.28, 0);
  lampLight.castShadow = true;
  group.add(lampLight);

  return group;
}

export function buildRotunda({ materials, collisionWorld }) {
  const group = new THREE.Group();
  let statusLamp = null;

  // Floor — built directly from the octagon vertices (see OctagonGeometry.js)
  // rather than a rotated CircleGeometry, so it lines up exactly with the
  // wall segments below and never drifts out of the horizontal plane.
  const floor = new THREE.Mesh(makeOctagonFloor(ROTUNDA_RADIUS, 3), materials.floor);
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling with a raised lantern opening at the centre (GDD §4 skylight anchor)
  const ceiling = new THREE.Mesh(makeOctagonAnnulus(2.6, ROTUNDA_RADIUS + 1), materials.ceiling);
  ceiling.position.y = ROTUNDA_HEIGHT;
  group.add(ceiling);

  const lanternWallGeo = new THREE.CylinderGeometry(2.6, 2.6, ROTUNDA_LANTERN_HEIGHT, 8, 1, true);
  const lanternWall = new THREE.Mesh(lanternWallGeo, materials.plaster);
  lanternWall.position.y = ROTUNDA_HEIGHT + ROTUNDA_LANTERN_HEIGHT / 2;
  group.add(lanternWall);

  const skylightGlass = new THREE.Mesh(new THREE.CircleGeometry(2.6, 8), materials.glassFrosted);
  skylightGlass.rotation.x = -Math.PI / 2;
  skylightGlass.position.y = ROTUNDA_HEIGHT + ROTUNDA_LANTERN_HEIGHT;
  group.add(skylightGlass);

  const skyLight = new THREE.PointLight(0xfff1d6, 60, 24, 1.5);
  skyLight.position.set(0, ROTUNDA_HEIGHT + ROTUNDA_LANTERN_HEIGHT - 0.4, 0);
  skyLight.castShadow = true;
  group.add(skyLight);

  const sun = new THREE.DirectionalLight(0xffe6bf, 1.8);
  sun.position.set(4, ROTUNDA_HEIGHT + ROTUNDA_LANTERN_HEIGHT + 6, 3);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  group.add(sun);
  group.add(sun.target);

  // Walls
  for (let k = 0; k < 8; k++) {
    const a = ROTUNDA_VERTICES[k];
    const b = ROTUNDA_VERTICES[(k + 1) % 8];
    const { length, angle, midX, midZ, dx, dz } = edgeGeometry(a, b);
    const edge = ROTUNDA_EDGES[k];

    if (edge.role === 'gate-open') {
      const pierLen = (length - GATE_WIDTH) / 2;
      for (const sign of [-1, 1]) {
        const panel = makeWallPanel(pierLen, ROTUNDA_HEIGHT, materials.woodPanel);
        const offset = sign * (GATE_WIDTH / 2 + pierLen / 2);
        panel.position.set(midX + dx * offset, ROTUNDA_HEIGHT / 2, midZ + dz * offset);
        panel.rotation.y = angle;
        group.add(panel);

        const p1x = midX + dx * (offset - pierLen / 2);
        const p1z = midZ + dz * (offset - pierLen / 2);
        const p2x = midX + dx * (offset + pierLen / 2);
        const p2z = midZ + dz * (offset + pierLen / 2);
        collisionWorld.addSegment(p1x, p1z, p2x, p2z);
      }
      const header = new THREE.Mesh(new THREE.BoxGeometry(GATE_WIDTH + 0.3, ROTUNDA_HEIGHT - GATE_HEIGHT, 0.3), materials.woodPanel);
      header.position.set(midX, GATE_HEIGHT + (ROTUNDA_HEIGHT - GATE_HEIGHT) / 2, midZ);
      header.rotation.y = angle;
      group.add(header);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(GATE_WIDTH + 0.16, GATE_HEIGHT, 0.06), materials.brass);
      frame.position.set(midX, GATE_HEIGHT / 2, midZ);
      frame.rotation.y = angle;
      group.add(frame);

      // World-response indicator (GDD §6.1): dark until Case 001 closes,
      // then the building "notices" — no UI, just a light that wasn't lit before.
      const lampX = midX + dx * (GATE_WIDTH / 2 + 0.22);
      const lampZ = midZ + dz * (GATE_WIDTH / 2 + 0.22);
      const lampBody = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 10), materials.brass);
      lampBody.position.set(lampX, GATE_HEIGHT - 0.3, lampZ);
      group.add(lampBody);
      statusLamp = new THREE.PointLight(0x8fae7c, 0, 3.4, 2);
      statusLamp.position.set(lampX, GATE_HEIGHT - 0.3, lampZ);
      group.add(statusLamp);

      continue;
    }

    const panel = makeWallPanel(length, ROTUNDA_HEIGHT, materials.woodPanel);
    panel.position.set(midX, ROTUNDA_HEIGHT / 2, midZ);
    panel.rotation.y = angle;
    group.add(panel);
    collisionWorld.addSegment(a.x, a.z, b.x, b.z);

    const wainscot = new THREE.Mesh(new THREE.BoxGeometry(length * 0.98, 0.9, 0.32), materials.darkGreen);
    wainscot.position.set(midX, 0.45, midZ);
    wainscot.rotation.y = angle;
    group.add(wainscot);

    if (edge.role === 'gate-locked') {
      const gate = buildLockedGate(materials, GATE_WIDTH, GATE_HEIGHT);
      gate.position.set(midX - dz * -0.02, 0, midZ + dx * -0.02);
      gate.rotation.y = angle;
      group.add(gate);
    } else if (edge.role === 'solid-intake') {
      // (dx,dz) runs *along* the wall; the inward normal for a regular
      // polygon centred on the origin is just the normalized midpoint.
      const midLen = Math.hypot(midX, midZ) || 1;
      const inwardX = -midX / midLen;
      const inwardZ = -midZ / midLen;
      const desk = buildIntakeDesk(materials);
      desk.position.set(midX + inwardX * 1.4, 0, midZ + inwardZ * 1.4);
      desk.rotation.y = angle + Math.PI;
      group.add(desk);
    } else if (edge.role === 'solid-memorial') {
      const wall = buildMemorialWall(materials, length, ROTUNDA_HEIGHT);
      wall.position.set(midX, 0, midZ);
      wall.rotation.y = angle;
      group.add(wall);
    } else if (edge.role === 'solid-lamp') {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), materials.brass);
      post.position.set(midX - dx * 0, 0.9, midZ - dz * 0);
      group.add(post);
      const shade = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), materials.glassFrosted);
      shade.position.set(midX, 1.75, midZ);
      group.add(shade);
      const bulb = new THREE.PointLight(0xffcf99, 16, 6, 1.8);
      bulb.position.set(midX, 1.75, midZ);
      group.add(bulb);
    }
  }

  return { group, statusLamp };
}
