export interface CameraKeyframe {
  id: string;
  year: number;
  center: [number, number];
  zoom: number;
  /** Bearing in degrees — rotates the whole map around the viewport center. */
  rotation: number;
  /** Degrees of 3D tilt (rotateX) applied to the map plane for a cinematic angle. */
  tilt: number;
}

export type CameraKeyframeDraft = Omit<CameraKeyframe, 'id'>;
