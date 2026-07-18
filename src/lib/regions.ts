import { useTerritoriesStore } from '../store/territoriesStore';
import { getRegionCentroid as getBuiltInRegionCentroid, getRegionName as getBuiltInRegionName } from '../data/historicalRegions';
import { geometryCentroid } from './geometry';
import { getWorldCountryFeatures } from './geo';
import type { CustomTerritory } from '../types/territory';
import type { TerritoryGeometry } from '../types/territory';
import type { Polygon, MultiPolygon } from 'geojson';

export function findTerritory(regionId: string | undefined): CustomTerritory | undefined {
  if (!regionId) return undefined;
  return useTerritoriesStore.getState().territories.find((t) => t.id === regionId);
}

export function isTerritoryId(regionId: string | undefined): boolean {
  return Boolean(findTerritory(regionId));
}

/** Resolves the centroid of any region type: custom territory, historical multi-country region, or a single country. */
export function resolveRegionCentroid(regionId: string | undefined): [number, number] | null {
  if (!regionId) return null;
  const territory = findTerritory(regionId);
  if (territory) return geometryCentroid(territory.geometry);
  return getBuiltInRegionCentroid(regionId) ?? null;
}

export function resolveRegionName(regionId: string | undefined, lang: 'ar' | 'en'): string {
  if (!regionId) return '';
  const territory = findTerritory(regionId);
  if (territory) return territory.name;
  return getBuiltInRegionName(regionId, lang);
}

/** Geometry for any selectable shape: a custom territory, or a modern country's own polygon. */
export function getShapeGeometry(id: string): TerritoryGeometry | null {
  const territory = findTerritory(id);
  if (territory) return territory.geometry;
  const countryFeature = getWorldCountryFeatures().find((f) => f.id === id);
  if (countryFeature && (countryFeature.geometry.type === 'Polygon' || countryFeature.geometry.type === 'MultiPolygon')) {
    return countryFeature.geometry as Polygon | MultiPolygon;
  }
  return null;
}

export function getShapeName(id: string, lang: 'ar' | 'en'): string {
  return resolveRegionName(id, lang);
}
