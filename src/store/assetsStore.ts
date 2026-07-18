import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlacedAsset, PlacedAssetDraft } from '../types/asset';

function makeId(): string {
  return `asset_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

interface AssetsState {
  assets: PlacedAsset[];
  selectedAssetId: string | null;
  addAsset: (draft: PlacedAssetDraft) => string;
  updateAsset: (id: string, patch: Partial<PlacedAssetDraft>) => void;
  removeAsset: (id: string) => void;
  selectAsset: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  duplicateAsset: (id: string) => void;
  moveAsset: (id: string, direction: 'up' | 'down') => void;
}

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set, get) => ({
      assets: [],
      selectedAssetId: null,

      addAsset: (draft) => {
        const id = makeId();
        const { assets } = get();
        set({ assets: [...assets, { ...draft, id, order: assets.length }], selectedAssetId: id });
        return id;
      },

      updateAsset: (id, patch) => {
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
      },

      removeAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
          selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
        }));
      },

      selectAsset: (id) => set({ selectedAssetId: id }),

      toggleVisibility: (id) => {
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)) }));
      },

      toggleLock: (id) => {
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? { ...a, locked: !a.locked } : a)) }));
      },

      duplicateAsset: (id) => {
        const { assets } = get();
        const source = assets.find((a) => a.id === id);
        if (!source) return;
        const newId = makeId();
        set({
          assets: [
            ...assets,
            { ...source, id: newId, position: [source.position[0] + 1.5, source.position[1] + 1.5], order: assets.length },
          ],
          selectedAssetId: newId,
        });
      },

      moveAsset: (id, direction) => {
        const { assets } = get();
        const sorted = [...assets].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((a) => a.id === id);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
        const a = sorted[idx];
        const b = sorted[swapIdx];
        const aOrder = a.order;
        set({
          assets: assets.map((x) => {
            if (x.id === a.id) return { ...x, order: b.order };
            if (x.id === b.id) return { ...x, order: aOrder };
            return x;
          }),
        });
      },
    }),
    { name: 'has-assets-store-v1' },
  ),
);
