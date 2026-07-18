import { geoNaturalEarth1, geoPath, geoInterpolate, geoDistance } from 'd3-geo';
import type { GeoPath, GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldTopology from 'world-atlas/countries-110m.json';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

export const MAP_WIDTH = 980;
export const MAP_HEIGHT = 520;

export const projection: GeoProjection = geoNaturalEarth1()
  .scale(170)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 10]);

export const geoPathGenerator: GeoPath = geoPath(projection);

export interface CountryFeature extends Feature<Geometry, { name: string }> {
  id: string;
}

let cachedFeatures: CountryFeature[] | null = null;

export function getWorldCountryFeatures(): CountryFeature[] {
  if (cachedFeatures) return cachedFeatures;
  const topo = worldTopology as unknown as Topology;
  const collection = feature(
    topo,
    topo.objects.countries as GeometryCollection,
  ) as unknown as FeatureCollection<Geometry, { name: string }>;
  cachedFeatures = collection.features
    .filter((f) => f.id !== undefined)
    .map((f) => ({ ...f, id: String(f.id) })) as CountryFeature[];
  return cachedFeatures;
}

/** Project a [lon, lat] point to SVG [x, y] screen coordinates in the map's native viewBox space. */
export function project(lonLat: [number, number]): [number, number] {
  const p = projection(lonLat);
  return p ?? [MAP_WIDTH / 2, MAP_HEIGHT / 2];
}

/**
 * Build a smooth curved path (as an SVG path string) between two lon/lat points,
 * following the great-circle interpolation so long-distance arrows (e.g. naval
 * routes) bow naturally rather than cutting a straight line through landmasses.
 */
export function buildArcPath(from: [number, number], to: [number, number], steps = 32): string {
  const interpolate = geoInterpolate(from, to);
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    points.push(project(interpolate(i / steps)));
  }
  return points.reduce((d, [x, y], i) => d + `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`, '');
}

/** Sample points along the great-circle arc for animating a moving marker (troop/ship/migration dot). */
export function sampleArcPoints(from: [number, number], to: [number, number], steps = 60): [number, number][] {
  const interpolate = geoInterpolate(from, to);
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    points.push(project(interpolate(i / steps)));
  }
  return points;
}

/** Angular distance in radians between two lon/lat points, used to bias arrow curvature/duration by distance. */
export function angularDistance(from: [number, number], to: [number, number]): number {
  return geoDistance(from, to);
}
