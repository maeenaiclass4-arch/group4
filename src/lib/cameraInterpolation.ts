import type { CameraKeyframe } from '../types/camera';

export interface CameraState {
  center: [number, number];
  zoom: number;
  rotation: number;
  tilt: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolates camera state at `year` from the given keyframes. Returns null when there
 * are fewer than two keyframes or `year` falls outside their range — callers should fall
 * back to auto-follow/manual camera behavior in that case.
 */
export function interpolateCamera(keyframes: CameraKeyframe[], year: number): CameraState | null {
  if (keyframes.length < 2) return null;
  const sorted = [...keyframes].sort((a, b) => a.year - b.year);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (year < first.year || year > last.year) return null;

  let before = sorted[0];
  let after = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].year <= year && sorted[i + 1].year >= year) {
      before = sorted[i];
      after = sorted[i + 1];
      break;
    }
  }
  if (before.id === after.id) {
    return { center: before.center, zoom: before.zoom, rotation: before.rotation, tilt: before.tilt };
  }

  const span = after.year - before.year;
  const t = span === 0 ? 0 : (year - before.year) / span;

  return {
    center: [lerp(before.center[0], after.center[0], t), lerp(before.center[1], after.center[1], t)],
    zoom: lerp(before.zoom, after.zoom, t),
    rotation: lerp(before.rotation, after.rotation, t),
    tilt: lerp(before.tilt, after.tilt, t),
  };
}
