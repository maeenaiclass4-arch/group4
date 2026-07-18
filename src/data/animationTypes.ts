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
  { id: 'battle', icon: '⚔️', labelEn: 'Battle', labelAr: 'معركة', kind: 'arrow', defaultColor: '#e5484d', usesTarget: true },
  { id: 'peaceTreaty', icon: '🤝', labelEn: 'Peace Treaty', labelAr: 'معاهدة سلام', kind: 'connection', defaultColor: '#4ade80', usesTarget: true },
  { id: 'spreadOfIslam', icon: '🕌', labelEn: 'Spread of Islam', labelAr: 'انتشار الإسلام', kind: 'spread', defaultColor: '#2dd4bf', usesTarget: false },
  { id: 'spreadOfReligion', icon: '✝️', labelEn: 'Spread of Religion', labelAr: 'انتشار دين', kind: 'spread', defaultColor: '#a78bfa', usesTarget: false },
  { id: 'empireExpansion', icon: '👑', labelEn: 'Empire Expansion', labelAr: 'توسع إمبراطورية', kind: 'spread', defaultColor: '#f5a524', usesTarget: false },
  { id: 'newKingdom', icon: '🏛️', labelEn: 'New Kingdom', labelAr: 'مملكة جديدة', kind: 'fill', defaultColor: '#38bdf8', usesTarget: false },
  { id: 'empireCollapse', icon: '💀', labelEn: 'Empire Collapse', labelAr: 'سقوط إمبراطورية', kind: 'collapse', defaultColor: '#6b7280', usesTarget: false },
  { id: 'navalMovement', icon: '🚢', labelEn: 'Naval Movement', labelAr: 'تحرك بحري', kind: 'arrow', defaultColor: '#0ea5e9', usesTarget: true },
  { id: 'migration', icon: '🏹', labelEn: 'Migration', labelAr: 'هجرة', kind: 'arrow', defaultColor: '#eab308', usesTarget: true },
  { id: 'politicalAgreement', icon: '📜', labelEn: 'Political Agreement', labelAr: 'اتفاق سياسي', kind: 'connection', defaultColor: '#22c55e', usesTarget: true },
  { id: 'conquest', icon: '🔥', labelEn: 'Conquest', labelAr: 'فتح / غزو', kind: 'arrow', defaultColor: '#f43f5e', usesTarget: true },
];

export const ANIMATION_TYPE_BY_ID: Record<AnimationTypeId, AnimationTypeDef> = Object.fromEntries(
  ANIMATION_TYPES.map((a) => [a.id, a]),
) as Record<AnimationTypeId, AnimationTypeDef>;
