import turfUnion from '@turf/union';
import turfDifference from '@turf/difference';
import turfIntersect from '@turf/intersect';
import turfCentroid from '@turf/centroid';
import turfBbox from '@turf/bbox';
import turfArea from '@turf/area';
import turfRewind from '@turf/rewind';
import { featureCollection, polygon, feature as turfFeature } from '@turf/helpers';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { TerritoryGeometry } from '../types/territory';

type PolyFeature = Feature<Polygon | MultiPolygon>;

export function toFeature(geometry: TerritoryGeometry): PolyFeature {
  return turfFeature(geometry) as PolyFeature;
}

/**
 * d3-geo's spherical clipping expects the opposite ring winding from Turf's
 * default RFC 7946 output — without this, a unioned/drawn polygon can render
 * as its own inverse (a near-global shape with the real region punched out
 * as a hole). Every territory geometry must pass through here before it's
 * stored or handed to geoPathGenerator.
 */
export function normalizeWinding(geometry: TerritoryGeometry): TerritoryGeometry {
  const rewound = turfRewind(toFeature(geometry), { reverse: true }) as PolyFeature;
  return rewound.geometry as TerritoryGeometry;
}

/** Union of two or more polygon/multipolygon geometries. Returns null if nothing to combine. */
export function unionGeometries(geometries: TerritoryGeometry[]): TerritoryGeometry | null {
  if (geometries.length === 0) return null;
  if (geometries.length === 1) return normalizeWinding(geometries[0]);
  const fc = featureCollection(geometries.map((g) => toFeature(g)));
  const result = turfUnion(fc);
  return result ? normalizeWinding(result.geometry as TerritoryGeometry) : null;
}

/** Subtracts `subtract` from `base`. */
export function differenceGeometries(base: TerritoryGeometry, subtract: TerritoryGeometry): TerritoryGeometry | null {
  const fc = featureCollection([toFeature(base), toFeature(subtract)]);
  const result = turfDifference(fc);
  return result ? normalizeWinding(result.geometry as TerritoryGeometry) : null;
}

/** Intersection of two geometries. Returns null if they don't overlap. */
export function intersectGeometries(a: TerritoryGeometry, b: TerritoryGeometry): TerritoryGeometry | null {
  const fc = featureCollection([toFeature(a), toFeature(b)]);
  const result = turfIntersect(fc);
  return result ? normalizeWinding(result.geometry as TerritoryGeometry) : null;
}

export function geometryCentroid(geometry: TerritoryGeometry): [number, number] {
  const c = turfCentroid(toFeature(geometry));
  return c.geometry.coordinates as [number, number];
}

export function geometryBbox(geometry: TerritoryGeometry): [number, number, number, number] {
  return turfBbox(toFeature(geometry)) as [number, number, number, number];
}

export function geometryArea(geometry: TerritoryGeometry): number {
  return turfArea(toFeature(geometry));
}

/** Builds a simple Polygon geometry from an ordered ring of [lon, lat] points (auto-closes the ring). */
export function polygonFromPoints(points: [number, number][]): Polygon {
  const ring = [...points];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);
  return normalizeWinding(polygon([ring]).geometry) as Polygon;
}
