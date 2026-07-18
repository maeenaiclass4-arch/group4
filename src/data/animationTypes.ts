import type { AnimationRenderKind, AnimationTypeId } from '../types/event';

export interface AnimationTypeDef {
  id: AnimationTypeId;
  icon: string;
  labelEn: string;
  labelAr: string;
  kind: AnimationRenderKind;
  defaultColor: string;
  /** Whether this animation type expects a second (target) region. */
  usesTarget: boolean;
}

export const ANIMATION_TYPES: AnimationTypeDef[] = [
  { id: 'battle', icon: '⚔️', labelEn: 'Battle', labelAr: 'معركة', kind: 'arrow', defaultColor: '#8c1f28', usesTarget: true },
  { id: 'peaceTreaty', icon: '🤝', labelEn: 'Peace Treaty', labelAr: 'معاهدة سلام', kind: 'connection', defaultColor: '#1f5c46', usesTarget: true },
  { id: 'spreadOfIslam', icon: '🕌', labelEn: 'Spread of Islam', labelAr: 'انتشار الإسلام', kind: 'spread', defaultColor: '#2f6b63', usesTarget: false },
  { id: 'spreadOfReligion', icon: '✝️', labelEn: 'Spread of Religion', labelAr: 'انتشار دين', kind: 'spread', defaultColor: '#5b3358', usesTarget: false },
  { id: 'empireExpansion', icon: '👑', labelEn: 'Empire Expansion', labelAr: 'توسع إمبراطورية', kind: 'spread', defaultColor: '#a67c27', usesTarget: false },
  { id: 'newKingdom', icon: '🏛️', labelEn: 'New Kingdom', labelAr: 'مملكة جديدة', kind: 'fill', defaultColor: '#3f5566', usesTarget: false },
  { id: 'empireCollapse', icon: '💀', labelEn: 'Empire Collapse', labelAr: 'سقوط إمبراطورية', kind: 'collapse', defaultColor: '#5a4a3a', usesTarget: false },
  { id: 'navalMovement', icon: '🚢', labelEn: 'Naval Movement', labelAr: 'تحرك بحري', kind: 'arrow', defaultColor: '#2e3a59', usesTarget: true },
  { id: 'migration', icon: '🏹', labelEn: 'Migration', labelAr: 'هجرة', kind: 'arrow', defaultColor: '#a6532f', usesTarget: true },
  { id: 'politicalAgreement', icon: '📜', labelEn: 'Political Agreement', labelAr: 'اتفاق سياسي', kind: 'connection', defaultColor: '#4a6741', usesTarget: true },
  { id: 'conquest', icon: '🔥', labelEn: 'Conquest', labelAr: 'فتح / غزو', kind: 'arrow', defaultColor: '#7a2e33', usesTarget: true },
];

export const ANIMATION_TYPE_BY_ID: Record<AnimationTypeId, AnimationTypeDef> = Object.fromEntries(
  ANIMATION_TYPES.map((a) => [a.id, a]),
) as Record<AnimationTypeId, AnimationTypeDef>;
