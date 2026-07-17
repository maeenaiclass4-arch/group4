/**
 * Single source of truth for the vertical slice's geometry: the Rotunda
 * (regular octagon, flat-sided, one open gate) plus the Registry Wing's
 * corridor and case room. All values in meters, Y-up, -Z is "into the
 * building" (GDD §3/§4 orientation).
 */
export const ROTUNDA_RADIUS = 9;
export const ROTUNDA_HEIGHT = 6.4;
export const ROTUNDA_LANTERN_HEIGHT = 3.2;

export const GATE_WIDTH = 2.6;
export const GATE_HEIGHT = 3.1;

export const CORRIDOR_WIDTH = GATE_WIDTH;
export const CORRIDOR_LENGTH = 9;
export const CORRIDOR_HEIGHT = 3.4;

export const ROOM_HALF_WIDTH = 3.5;
export const ROOM_DEPTH = 7;
export const ROOM_HEIGHT = 3.6;

function octagonVertices(r) {
  const verts = [];
  for (let k = 0; k < 8; k++) {
    const angle = Math.PI / 8 + k * (Math.PI / 4);
    verts.push({ x: r * Math.cos(angle), z: r * Math.sin(angle) });
  }
  return verts;
}

export const ROTUNDA_VERTICES = octagonVertices(ROTUNDA_RADIUS);

// Edge index -> role, derived once from the vertex geometry above (edge k
// runs from vertex k to vertex k+1). See LevelLayout design notes: edge 1
// is due south (intake wall, no gate); edge 5 is due north (Registry gate,
// open); the remaining edges alternate between locked wing gates and solid
// decorative walls.
export const ROTUNDA_EDGES = [
  { role: 'gate-locked', label: 'Reading Room' }, // 0 — NE
  { role: 'solid-intake' }, // 1 — S
  { role: 'solid-memorial' }, // 2 — SW
  { role: 'gate-locked', label: 'Substrata' }, // 3 — W
  { role: 'gate-locked', label: 'Clockwork Wing' }, // 4 — NW
  { role: 'gate-open', label: 'Registry Wing' }, // 5 — N
  { role: 'solid-lamp' }, // 6 — SE
  { role: 'gate-locked', label: 'Conservatory' }, // 7 — E
];

// North gate mouth: edge 5 runs from vertex 5 (-3.444,-8.315) to vertex 6
// (3.444,-8.315) — a straight span at z = -ROTUNDA_RADIUS*sin(67.5°).
export const NORTH_WALL_Z = -8.3147;
export const CORRIDOR_START_Z = NORTH_WALL_Z;
export const CORRIDOR_END_Z = CORRIDOR_START_Z - CORRIDOR_LENGTH;

export const ROOM_NEAR_Z = CORRIDOR_END_Z;
export const ROOM_FAR_Z = ROOM_NEAR_Z - ROOM_DEPTH;

export const SPAWN_POSE = { x: 0, y: 1.68, z: 8.6, yaw: Math.PI, pitch: 0 };

export const DESK_POSITION = { x: 0.9, z: ROOM_FAR_Z + 1.1 };
export const CHAIR_HOME = { x: 0.9, z: ROOM_FAR_Z + 2.05, ry: 0 };
export const CHAIR_TARGET = { x: 1.85, z: ROOM_FAR_Z + 2.6, ry: 2.35 };
export const CHAIR_SLOTS = [
  { x: 0.9, z: ROOM_FAR_Z + 2.05, ry: 0 }, // 0: tucked under the desk
  { x: 0.9, z: ROOM_FAR_Z + 2.9, ry: 0 }, // 1: pulled straight back
  { x: 1.6, z: ROOM_FAR_Z + 2.3, ry: 1.1 }, // 2: swung aside
  { x: 1.85, z: ROOM_FAR_Z + 2.6, ry: 2.35 }, // 3: the photograph's arrangement — solves the case
];
export const CHAIR_SOLUTION_SLOT = 3;

export const CORKBOARD_POSITION = { x: -ROOM_HALF_WIDTH + 0.05, z: ROOM_FAR_Z + 2.4 };
export const COMPARTMENT_POSITION = { x: 0.9, z: ROOM_FAR_Z + 1.75 };
