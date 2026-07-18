import type { AssetKind } from '../types/asset';

export interface AssetDef {
  kind: AssetKind;
  /** Emoji glyph, or null if this asset uses a custom SVG (see TankGlyph). */
  icon: string | null;
  labelEn: string;
  labelAr: string;
}

export const ASSET_DEFS: AssetDef[] = [
  { kind: 'sword', icon: '⚔️', labelEn: 'Sword', labelAr: 'سيف' },
  { kind: 'shield', icon: '🛡️', labelEn: 'Shield', labelAr: 'درع' },
  { kind: 'flag', icon: '🚩', labelEn: 'Flag', labelAr: 'علم' },
  { kind: 'crown', icon: '👑', labelEn: 'Crown', labelAr: 'تاج' },
  { kind: 'ship', icon: '🚢', labelEn: 'Ship', labelAr: 'سفينة' },
  { kind: 'horse', icon: '🐎', labelEn: 'Horse', labelAr: 'حصان' },
  { kind: 'army', icon: '🪖', labelEn: 'Army', labelAr: 'جيش' },
  { kind: 'tank', icon: null, labelEn: 'Tank', labelAr: 'دبابة' },
  { kind: 'plane', icon: '✈️', labelEn: 'Plane', labelAr: 'طائرة' },
  { kind: 'explosion', icon: '💥', labelEn: 'Explosion', labelAr: 'انفجار' },
  { kind: 'fire', icon: '🔥', labelEn: 'Fire', labelAr: 'حريق' },
  { kind: 'handshake', icon: '🤝', labelEn: 'Handshake', labelAr: 'مصافحة' },
  { kind: 'cross', icon: '✝️', labelEn: 'Cross', labelAr: 'صليب' },
  { kind: 'crescent', icon: '☪️', labelEn: 'Crescent', labelAr: 'هلال' },
  { kind: 'star', icon: '⭐', labelEn: 'Star', labelAr: 'نجمة' },
  { kind: 'castle', icon: '🏰', labelEn: 'Castle', labelAr: 'قلعة' },
  { kind: 'city', icon: '🏙️', labelEn: 'City', labelAr: 'مدينة' },
  { kind: 'capital', icon: '🏛️', labelEn: 'Capital', labelAr: 'عاصمة' },
];

export const ASSET_DEF_BY_KIND: Record<AssetKind, AssetDef> = Object.fromEntries(
  ASSET_DEFS.map((a) => [a.kind, a]),
) as Record<AssetKind, AssetDef>;
