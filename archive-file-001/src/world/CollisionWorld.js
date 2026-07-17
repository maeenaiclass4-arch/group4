/**
 * Minimal circle-vs-segment collision for a flat, single-level building.
 * The player is treated as a circle in the XZ plane; every wall is a line
 * segment. Doorways are simply gaps left in the segment list — no special
 * "doorway" object needed, which is why gates (GDD §4) and puzzle-room
 * thresholds all use the same system.
 */
export class CollisionWorld {
  segments = [];
  boxes = [];

  addSegment(ax, az, bx, bz) {
    this.segments.push({ ax, az, bx, bz });
  }

  addBox(minX, maxX, minZ, maxZ) {
    this.addSegment(minX, minZ, maxX, minZ);
    this.addSegment(maxX, minZ, maxX, maxZ);
    this.addSegment(maxX, maxZ, minX, maxZ);
    this.addSegment(minX, maxZ, minX, minZ);
    this.boxes.push({ minX, maxX, minZ, maxZ });
  }

  resolve(x, z, radius) {
    let px = x;
    let pz = z;
    for (const s of this.segments) {
      const dx = s.bx - s.ax;
      const dz = s.bz - s.az;
      const lenSq = dx * dx + dz * dz || 1;
      let t = ((px - s.ax) * dx + (pz - s.az) * dz) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = s.ax + t * dx;
      const cz = s.az + t * dz;
      const ddx = px - cx;
      const ddz = pz - cz;
      const distSq = ddx * ddx + ddz * ddz;
      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const push = (radius - dist) / dist;
        px += ddx * push;
        pz += ddz * push;
      }
    }

    // The segment loop above only pushes a point that's already *near* a
    // wall/box edge — a point placed well inside a box's footprint (e.g. a
    // save recorded before that box existed) is too far from every edge to
    // trigger it, and would stay embedded in the mesh forever. This second
    // pass catches that case: any point still inside a box's true bounds
    // gets ejected straight out through the nearest face.
    for (const b of this.boxes) {
      if (px <= b.minX || px >= b.maxX || pz <= b.minZ || pz >= b.maxZ) continue;
      const distLeft = px - b.minX;
      const distRight = b.maxX - px;
      const distNear = pz - b.minZ;
      const distFar = b.maxZ - pz;
      const min = Math.min(distLeft, distRight, distNear, distFar);
      if (min === distLeft) px = b.minX - radius;
      else if (min === distRight) px = b.maxX + radius;
      else if (min === distNear) pz = b.minZ - radius;
      else pz = b.maxZ + radius;
    }

    return { x: px, z: pz };
  }
}
