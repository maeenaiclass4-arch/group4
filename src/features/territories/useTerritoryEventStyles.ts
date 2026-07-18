import { useMemo } from 'react';
import type { ActiveEvent } from '../playback/engine';
import { ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';
import { findTerritory } from '../../lib/regions';
import { lerpColor } from '../../lib/color';

export interface TerritoryEventStyle {
  fillColor: string;
  opacity: number;
  strokeColor: string;
  strokeWidth: number;
}

const COLLAPSE_TARGET = '#8a7a5f';

/** Animated style overrides for custom territories that are the region of an active event. */
export function useTerritoryEventStyles(activeEvents: ActiveEvent[]): Map<string, TerritoryEventStyle> {
  return useMemo(() => {
    const styles = new Map<string, TerritoryEventStyle>();

    for (const { event, progress, rawT } of activeEvents) {
      const territory = findTerritory(event.region);
      if (!territory) continue;
      const def = ANIMATION_TYPE_BY_ID[event.animationType];

      switch (def.kind) {
        case 'fill':
          styles.set(territory.id, {
            fillColor: event.color,
            opacity: 0.15 + progress * 0.55,
            strokeColor: event.color,
            strokeWidth: 1.5 + progress * 1.5,
          });
          break;
        case 'spread':
          styles.set(territory.id, {
            fillColor: event.color,
            opacity: 0.12 + rawT * 0.55,
            strokeColor: event.color,
            strokeWidth: 1.5 + rawT * 1.5,
          });
          break;
        case 'collapse':
          styles.set(territory.id, {
            fillColor: lerpColor(event.color, COLLAPSE_TARGET, rawT),
            opacity: 0.5 - rawT * 0.4,
            strokeColor: COLLAPSE_TARGET,
            strokeWidth: Math.max(0.5, 2 - rawT * 1.5),
          });
          break;
        case 'arrow':
        case 'connection':
          styles.set(territory.id, {
            fillColor: territory.fillColor,
            opacity: territory.opacity,
            strokeColor: event.color,
            strokeWidth: 1.5 + progress * 1.5,
          });
          break;
      }
    }

    return styles;
  }, [activeEvents]);
}
