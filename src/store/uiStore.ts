import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PickableField = 'region' | 'targetRegion' | null;

interface UiState {
  inspectorOpen: boolean;
  eventListOpen: boolean;
  pickingField: PickableField;
  toggleInspector: () => void;
  toggleEventList: () => void;
  setPickingField: (field: PickableField) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      inspectorOpen: true,
      eventListOpen: true,
      pickingField: null,
      toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
      toggleEventList: () => set((s) => ({ eventListOpen: !s.eventListOpen })),
      setPickingField: (pickingField) => set({ pickingField }),
    }),
    { name: 'has-ui-store-v1', partialize: (state) => ({ inspectorOpen: state.inspectorOpen, eventListOpen: state.eventListOpen }) },
  ),
);
