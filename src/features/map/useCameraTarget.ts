import { useMemo } from 'react';
import type { ActiveEvent } from '../playback/engine';
import { resolveCountryIds } from '../../data/historicalRegions';
import { COUNTRY_BY_ID } from '../../data/countries';
import { findTerritory } from '../../lib/regions';
import { geometryBbox } from '../../lib/geometry';

const DEFAULT_CENTER: [number, number] = [30, 25];
const DEFAULT_ZOOM = 1;

/** All anchor points covering a region: a custom territory's bbox corners, or member-country centroids. */
function anchorPoints(regionId: string | undefined): [number, number][] {
  if (!regionId) return [];
  const territory = findTerritory(regionId);
  if (territory) {
    const [minLon, minLat, maxLon, maxLat] = geometryBbox(territory.geometry);
    return [
      [minLon, minLat],
      [maxLon, maxLat],
    ];
  }
  return resolveCountryIds(regionId)
    .map((id) => COUNTRY_BY_ID[id]?.centroid)
    .filter((c): c is [number, number] => Boolean(c));
}

/** Derives a camera target (center + zoom) that frames whatever events are currently animating on the map. */
export function useCameraTarget(activeEvents: ActiveEvent[]): { center: [number, number]; zoom: number } {
  return useMemo(() => {
    const points: [number, number][] = [];
    for (const { event } of activeEvents) {
      points.push(...anchorPoints(event.region));
      points.push(...anchorPoints(event.targetRegion));
    }

    if (points.length === 0) return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };

    const lons = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
    const span = Math.max(maxLon - minLon, maxLat - minLat, 10);
    const zoom = Math.min(3.2, Math.max(1.2, 65 / span));

    return { center, zoom };
  }, [activeEvents]);
}
