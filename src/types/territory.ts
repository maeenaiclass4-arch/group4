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

  /** Smart label — shown as a draggable card near the territory. */
  labelVisible: boolean;
  labelYears?: string;
  labelCapital?: string;
  labelPopulation?: string;
  labelNotes?: string;
  /** Absolute [lon, lat] the label card is pinned to; unset until the user drags it or enables the label for the first time. */
  labelPosition?: [number, number];
}

export type CustomTerritoryDraft = Omit<CustomTerritory, 'id' | 'order'>;
