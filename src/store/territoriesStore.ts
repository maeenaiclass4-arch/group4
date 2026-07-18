import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';
import type { CustomTerritory, CustomTerritoryDraft } from '../types/territory';

function makeId(): string {
  return `terr_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

interface TerritoriesState {
  territories: CustomTerritory[];
  selectedTerritoryId: string | null;
  addTerritory: (draft: CustomTerritoryDraft) => string;
  updateTerritory: (id: string, patch: Partial<CustomTerritoryDraft>) => void;
  removeTerritory: (id: string) => void;
  selectTerritory: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  duplicateTerritory: (id: string) => void;
  moveTerritory: (id: string, direction: 'up' | 'down') => void;
}

export const useTerritoriesStore = create<TerritoriesState>()(
  persist(
    (set, get) => ({
      territories: [],
      selectedTerritoryId: null,

      addTerritory: (draft) => {
        const id = makeId();
        const { territories } = get();
        set({
          territories: [...territories, { ...draft, id, order: territories.length }],
          selectedTerritoryId: id,
        });
        return id;
      },

      updateTerritory: (id, patch) => {
        set((state) => ({
          territories: state.territories.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }));
      },

      removeTerritory: (id) => {
        set((state) => ({
          territories: state.territories.filter((t) => t.id !== id),
          selectedTerritoryId: state.selectedTerritoryId === id ? null : state.selectedTerritoryId,
        }));
      },

      selectTerritory: (id) => set({ selectedTerritoryId: id }),

      toggleVisibility: (id) => {
        set((state) => ({
          territories: state.territories.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)),
        }));
      },

      toggleLock: (id) => {
        set((state) => ({
          territories: state.territories.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)),
        }));
      },

      duplicateTerritory: (id) => {
        const { territories } = get();
        const source = territories.find((t) => t.id === id);
        if (!source) return;
        const newId = makeId();
        set({
          territories: [
            ...territories,
            { ...source, id: newId, name: `${source.name} ${i18n.t('territory.duplicateSuffix')}`, order: territories.length },
          ],
          selectedTerritoryId: newId,
        });
      },

      moveTerritory: (id, direction) => {
        const { territories } = get();
        const sorted = [...territories].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((t) => t.id === id);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
        const a = sorted[idx];
        const b = sorted[swapIdx];
        const aOrder = a.order;
        set({
          territories: territories.map((t) => {
            if (t.id === a.id) return { ...t, order: b.order };
            if (t.id === b.id) return { ...t, order: aOrder };
            return t;
          }),
        });
      },
    }),
    { name: 'has-territories-store-v1' },
  ),
);
