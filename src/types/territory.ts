import type { Polygon, MultiPolygon } from 'geojson';

export type TerritoryGeometry = Polygon | MultiPolygon;

export interface CustomTerritory {
  id: string;
  name: string;
  geometry: TerritoryGeometry;
  fillColor: string;
  strokeColor: string;
  /** Base fill opacity, 0–1. */
  opacity: number;
  strokeWidth: number;
  visible: boolean;
  locked: boolean;
  order: number;
  /** Country ids this territory was merged/derived from, if any — kept for reference only. */
  sourceCountryIds?: string[];
}

export type CustomTerritoryDraft = Omit<CustomTerritory, 'id' | 'order'>;
