import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PickableField = 'region' | 'targetRegion' | null;
export type LeftPanelTab = 'events' | 'territories';
export type MapTool = 'idle' | 'draw';

interface UiState {
  inspectorOpen: boolean;
  eventListOpen: boolean;
  pickingField: PickableField;
  leftPanelTab: LeftPanelTab;
  mapTool: MapTool;
  /** Country / territory ids selected (via Ctrl+Click) for merge or boolean operations. */
  selectedShapeIds: string[];
  toggleInspector: () => void;
  toggleEventList: () => void;
  setPickingField: (field: PickableField) => void;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  setMapTool: (tool: MapTool) => void;
  toggleShapeSelection: (id: string) => void;
  clearShapeSelection: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      inspectorOpen: true,
      eventListOpen: true,
      pickingField: null,
      leftPanelTab: 'events',
      mapTool: 'idle',
      selectedShapeIds: [],
      toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
      toggleEventList: () => set((s) => ({ eventListOpen: !s.eventListOpen })),
      setPickingField: (pickingField) => set({ pickingField }),
      setLeftPanelTab: (leftPanelTab) => set({ leftPanelTab }),
      setMapTool: (mapTool) => set({ mapTool }),
      toggleShapeSelection: (id) =>
        set((s) => ({
          selectedShapeIds: s.selectedShapeIds.includes(id)
            ? s.selectedShapeIds.filter((x) => x !== id)
            : [...s.selectedShapeIds, id],
        })),
      clearShapeSelection: () => set({ selectedShapeIds: [] }),
    }),
    { name: 'has-ui-store-v1', partialize: (state) => ({ inspectorOpen: state.inspectorOpen, eventListOpen: state.eventListOpen }) },
  ),
);
