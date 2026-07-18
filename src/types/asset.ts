export type AssetKind =
  | 'sword'
  | 'shield'
  | 'flag'
  | 'crown'
  | 'ship'
  | 'horse'
  | 'army'
  | 'tank'
  | 'plane'
  | 'explosion'
  | 'fire'
  | 'handshake'
  | 'cross'
  | 'crescent'
  | 'star'
  | 'castle'
  | 'city'
  | 'capital';

export interface PlacedAsset {
  id: string;
  kind: AssetKind;
  position: [number, number];
  scale: number;
  rotation: number;
  visible: boolean;
  locked: boolean;
  order: number;
}

export type PlacedAssetDraft = Omit<PlacedAsset, 'id' | 'order'>;
