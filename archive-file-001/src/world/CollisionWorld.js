/**
 * Minimal circle-vs-segment collision for a flat, single-level building.
 * The player is treated as a circle in the XZ plane; every wall is a line
 * segment. Doorways are simply gaps left in the segment list — no special
 * "doorway" object needed, which is why gates (GDD §4) and puzzle-room
 * thresholds all use the same system.
 */
export class CollisionWorld {
  segments = [];

  addSegment(ax, az, bx, bz) {
    this.segments.push({ ax, az, bx, bz });
  }

  addBox(minX, maxX, minZ, maxZ) {
    this.addSegment(minX, minZ, maxX, minZ);
    this.addSegment(maxX, minZ, maxX, maxZ);
    this.addSegment(maxX, maxZ, minX, maxZ);
    this.addSegment(minX, maxZ, minX, minZ);
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
    return { x: px, z: pz };
  }
}
