import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CameraKeyframe, CameraKeyframeDraft } from '../types/camera';

function makeId(): string {
  return `cam_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

interface CameraKeyframesState {
  keyframes: CameraKeyframe[];
  selectedKeyframeId: string | null;
  addKeyframe: (draft: CameraKeyframeDraft) => string;
  updateKeyframe: (id: string, patch: Partial<CameraKeyframeDraft>) => void;
  removeKeyframe: (id: string) => void;
  selectKeyframe: (id: string | null) => void;
}

export const useCameraKeyframesStore = create<CameraKeyframesState>()(
  persist(
    (set, get) => ({
      keyframes: [],
      selectedKeyframeId: null,

      addKeyframe: (draft) => {
        const id = makeId();
        set({ keyframes: [...get().keyframes, { ...draft, id }], selectedKeyframeId: id });
        return id;
      },

      updateKeyframe: (id, patch) => {
        set((state) => ({ keyframes: state.keyframes.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));
      },

      removeKeyframe: (id) => {
        set((state) => ({
          keyframes: state.keyframes.filter((k) => k.id !== id),
          selectedKeyframeId: state.selectedKeyframeId === id ? null : state.selectedKeyframeId,
        }));
      },

      selectKeyframe: (id) => set({ selectedKeyframeId: id }),
    }),
    { name: 'has-camera-keyframes-store-v1' },
  ),
);
