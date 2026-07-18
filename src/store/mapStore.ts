import { create } from 'zustand';

interface MapCameraState {
  center: [number, number];
  zoom: number;
  /** When true, the playback engine drives the camera toward active events automatically. */
  autoFollow: boolean;
  setCamera: (center: [number, number], zoom: number) => void;
  setAutoFollow: (v: boolean) => void;
  resetCamera: () => void;
}

const DEFAULT_CENTER: [number, number] = [30, 25];
const DEFAULT_ZOOM = 1;

export const useMapStore = create<MapCameraState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  autoFollow: true,
  setCamera: (center, zoom) => set({ center, zoom }),
  setAutoFollow: (autoFollow) => set({ autoFollow }),
  resetCamera: () => set({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }),
}));
