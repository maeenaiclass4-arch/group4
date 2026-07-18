import { geoPathGenerator } from '../../lib/geo';
import { toFeature } from '../../lib/geometry';
import { withAlpha } from '../../lib/color';
import { useTerritoriesStore } from '../../store/territoriesStore';
import { useUiStore } from '../../store/uiStore';
import { useActiveEventsStore } from '../playback/engine';
import { useTerritoryEventStyles } from './useTerritoryEventStyles';

export function TerritoryLayer() {
  const territories = useTerritoriesStore((s) => s.territories);
  const selectedTerritoryId = useTerritoriesStore((s) => s.selectedTerritoryId);
  const selectTerritory = useTerritoriesStore((s) => s.selectTerritory);
  const leftPanelTab = useUiStore((s) => s.leftPanelTab);
  const setLeftPanelTab = useUiStore((s) => s.setLeftPanelTab);
  const mapTool = useUiStore((s) => s.mapTool);
  const selectedShapeIds = useUiStore((s) => s.selectedShapeIds);
  const toggleShapeSelection = useUiStore((s) => s.toggleShapeSelection);
  const pickingField = useUiStore((s) => s.pickingField);
  const activeEvents = useActiveEventsStore((s) => s.activeEvents);
  const eventStyles = useTerritoryEventStyles(activeEvents);

  const sorted = [...territories].sort((a, b) => a.order - b.order);

  return (
    <g className="territory-layer">
      {sorted.map((t) => {
        if (!t.visible) return null;
        const d = geoPathGenerator(toFeature(t.geometry)) ?? undefined;
        const isSelected = t.id === selectedTerritoryId && leftPanelTab === 'territories';
        const isMultiSelected = selectedShapeIds.includes(t.id);
        const animStyle = eventStyles.get(t.id);

        const fillColor = animStyle?.fillColor ?? t.fillColor;
        const fillOpacity = animStyle?.opacity ?? t.opacity;
        const strokeColor = isMultiSelected ? 'var(--secondary)' : animStyle?.strokeColor ?? t.strokeColor;
        const strokeWidth = isMultiSelected ? t.strokeWidth + 1.5 : animStyle?.strokeWidth ?? t.strokeWidth;

        return (
          <path
            key={t.id}
            d={d}
            fill={withAlpha(fillColor, fillOpacity)}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={isMultiSelected ? '5 3' : undefined}
            style={{
              cursor: mapTool === 'draw' ? undefined : 'pointer',
              filter: isSelected ? 'drop-shadow(0 0 2px var(--accent))' : undefined,
              transition: 'fill 0.3s ease, stroke-width 0.3s ease',
            }}
            onClick={(e) => {
              if (mapTool === 'draw') return;
              if (pickingField) return;
              if (e.ctrlKey || e.metaKey) {
                e.stopPropagation();
                toggleShapeSelection(t.id);
                return;
              }
              e.stopPropagation();
              setLeftPanelTab('territories');
              selectTerritory(t.id);
            }}
          >
            <title>{t.name}</title>
          </path>
        );
      })}
    </g>
  );
}
