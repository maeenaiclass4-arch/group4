import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorldCountryFeatures, geoPathGenerator } from '../../lib/geo';
import { COUNTRY_BY_ID } from '../../data/countries';
import { withAlpha } from '../../lib/color';
import type { CountryFillsResult } from './useCountryFills';
import { useUiStore } from '../../store/uiStore';
import { useEventsStore } from '../../store/eventsStore';

interface CountryLayerProps {
  fillsResult: CountryFillsResult;
}

export function CountryLayer({ fillsResult }: CountryLayerProps) {
  const { i18n } = useTranslation();
  const features = useMemo(() => getWorldCountryFeatures(), []);
  const pickingField = useUiStore((s) => s.pickingField);
  const setPickingField = useUiStore((s) => s.setPickingField);
  const selectedEventId = useEventsStore((s) => s.selectedEventId);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const mapTool = useUiStore((s) => s.mapTool);
  const selectedShapeIds = useUiStore((s) => s.selectedShapeIds);
  const toggleShapeSelection = useUiStore((s) => s.toggleShapeSelection);

  return (
    <g className="country-layer">
      {features.map((f) => {
        const fill = fillsResult.fills.get(f.id);
        const highlight = fillsResult.highlights.get(f.id);
        const country = COUNTRY_BY_ID[f.id];
        const name = country ? (i18n.language === 'ar' ? country.nameAr : country.nameEn) : f.properties?.name;
        const isMultiSelected = selectedShapeIds.includes(f.id);

        return (
          <path
            key={f.id}
            d={geoPathGenerator(f) ?? undefined}
            className={`country${pickingField ? ' country--pickable' : ''}`}
            fill={fill ? withAlpha(fill.color, fill.opacity) : 'var(--map-land)'}
            stroke={
              isMultiSelected
                ? 'var(--secondary)'
                : highlight
                  ? withAlpha(highlight.color, 0.65 + highlight.intensity * 0.35)
                  : 'var(--map-border)'
            }
            strokeWidth={isMultiSelected ? 2.5 : highlight ? 1.1 + highlight.intensity * 1.1 : 0.5}
            strokeDasharray={isMultiSelected ? '5 3' : undefined}
            style={
              highlight
                ? { filter: `drop-shadow(0 0 ${1 + highlight.intensity * 1.5}px ${withAlpha(highlight.color, 0.35)})` }
                : undefined
            }
            onClick={(e) => {
              if (mapTool === 'draw') return;
              if (pickingField && selectedEventId) {
                updateEvent(selectedEventId, { [pickingField]: f.id });
                setPickingField(null);
                return;
              }
              if (e.ctrlKey || e.metaKey) {
                e.stopPropagation();
                toggleShapeSelection(f.id);
              }
            }}
            data-region-id={f.id}
          >
            <title>{name}</title>
          </path>
        );
      })}
    </g>
  );
}
