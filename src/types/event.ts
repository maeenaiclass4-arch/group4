export type AnimationTypeId =
  | 'battle'
  | 'peaceTreaty'
  | 'spreadOfIslam'
  | 'spreadOfReligion'
  | 'empireExpansion'
  | 'newKingdom'
  | 'empireCollapse'
  | 'navalMovement'
  | 'migration'
  | 'politicalAgreement'
  | 'conquest';

/** How the effects layer renders an animation type on the map. */
export type AnimationRenderKind = 'fill' | 'spread' | 'collapse' | 'arrow' | 'connection';

export interface Track {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface HistoricalEvent {
  id: string;
  trackId: string;
  title: string;
  description: string;
  /** Negative years = BCE. */
  startYear: number;
  endYear?: number;
  /** Region id: either a modern country ISO-numeric id or a curated historical-region id. */
  region: string;
  /** Secondary region id — destination/opponent for arrows, treaties, and conquests. */
  targetRegion?: string;
  animationType: AnimationTypeId;
  color: string;
  /** Real-time seconds the on-map animation plays once triggered. */
  duration: number;
  /** Playback speed multiplier applied to the animation (0.25x - 4x). */
  speed: number;
}

export type HistoricalEventDraft = Omit<HistoricalEvent, 'id'>;
