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

  return (
    <g className="country-layer">
      {features.map((f) => {
        const fill = fillsResult.fills.get(f.id);
        const highlight = fillsResult.highlights.get(f.id);
        const country = COUNTRY_BY_ID[f.id];
        const name = country ? (i18n.language === 'ar' ? country.nameAr : country.nameEn) : f.properties?.name;

        return (
          <path
            key={f.id}
            d={geoPathGenerator(f) ?? undefined}
            className={`country${pickingField ? ' country--pickable' : ''}`}
            fill={fill ? withAlpha(fill.color, fill.opacity) : 'var(--map-land)'}
            stroke={highlight ? withAlpha(highlight.color, 0.65 + highlight.intensity * 0.35) : 'var(--map-border)'}
            strokeWidth={highlight ? 1.1 + highlight.intensity * 1.1 : 0.5}
            style={
              highlight
                ? { filter: `drop-shadow(0 0 ${2 + highlight.intensity * 4}px ${withAlpha(highlight.color, 0.55)})` }
                : undefined
            }
            onClick={() => {
              if (pickingField && selectedEventId) {
                updateEvent(selectedEventId, { [pickingField]: f.id });
                setPickingField(null);
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
