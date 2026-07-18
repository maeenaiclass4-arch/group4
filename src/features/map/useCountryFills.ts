import { useMemo } from 'react';
import type { ActiveEvent } from '../playback/engine';
import { ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';
import { resolveCountryIds, getRegionCentroid } from '../../data/historicalRegions';
import { COUNTRY_BY_ID } from '../../data/countries';
import { angularDistance } from '../../lib/geo';
import { lerpColor } from '../../lib/color';

export interface CountryFill {
  color: string;
  opacity: number;
}

export interface CountryHighlight {
  color: string;
  intensity: number;
}

export interface CountryFillsResult {
  fills: Map<string, CountryFill>;
  highlights: Map<string, CountryHighlight>;
}

const COLLAPSE_TARGET = '#8a7a5f';

function sortByDistanceFromCentroid(countryIds: string[], centroid: [number, number]): string[] {
  return [...countryIds].sort((a, b) => {
    const ca = COUNTRY_BY_ID[a]?.centroid;
    const cb = COUNTRY_BY_ID[b]?.centroid;
    const da = ca ? angularDistance(centroid, ca) : 0;
    const db = cb ? angularDistance(centroid, cb) : 0;
    return da - db;
  });
}

export function useCountryFills(activeEvents: ActiveEvent[]): CountryFillsResult {
  return useMemo(() => {
    const fills = new Map<string, CountryFill>();
    const highlights = new Map<string, CountryHighlight>();

    for (const { event, progress, rawT } of activeEvents) {
      const def = ANIMATION_TYPE_BY_ID[event.animationType];
      const sourceIds = resolveCountryIds(event.region);
      const targetIds = event.targetRegion ? resolveCountryIds(event.targetRegion) : [];

      switch (def.kind) {
        case 'fill': {
          for (const id of sourceIds) {
            fills.set(id, { color: event.color, opacity: 0.15 + progress * 0.55 });
            highlights.set(id, { color: event.color, intensity: progress });
          }
          break;
        }
        case 'spread': {
          const centroid = getRegionCentroid(event.region) ?? [0, 0];
          const ordered = sortByDistanceFromCentroid(sourceIds, centroid);
          const n = ordered.length || 1;
          ordered.forEach((id, i) => {
            const frontier = rawT * n - i;
            const local = Math.min(1, Math.max(0, frontier));
            if (local <= 0) return;
            fills.set(id, { color: event.color, opacity: 0.12 + local * 0.5 });
            if (frontier > 0 && frontier < 1.5) {
              highlights.set(id, { color: event.color, intensity: Math.min(1, frontier) });
            }
          });
          break;
        }
        case 'collapse': {
          for (const id of sourceIds) {
            const color = lerpColor(event.color, COLLAPSE_TARGET, rawT);
            fills.set(id, { color, opacity: 0.55 - rawT * 0.4 });
            highlights.set(id, { color: COLLAPSE_TARGET, intensity: rawT });
          }
          break;
        }
        case 'arrow': {
          const isConquest = event.animationType === 'conquest';
          for (const id of sourceIds) {
            highlights.set(id, { color: event.color, intensity: 0.5 + progress * 0.5 });
          }
          for (const id of targetIds) {
            if (isConquest && progress > 0.55) {
              const localT = Math.min(1, (progress - 0.55) / 0.45);
              fills.set(id, { color: event.color, opacity: 0.15 + localT * 0.55 });
            }
            highlights.set(id, { color: event.color, intensity: 0.3 + progress * 0.7 });
          }
          break;
        }
        case 'connection': {
          for (const id of [...sourceIds, ...targetIds]) {
            highlights.set(id, { color: event.color, intensity: 0.4 + progress * 0.6 });
          }
          break;
        }
      }
    }

    return { fills, highlights };
  }, [activeEvents]);
}
