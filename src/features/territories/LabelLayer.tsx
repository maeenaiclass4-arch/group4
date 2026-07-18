import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { project } from '../../lib/geo';
import { geometryCentroid } from '../../lib/geometry';
import { useTerritoriesStore } from '../../store/territoriesStore';

interface LabelLayerProps {
  svgToLonLat: (clientX: number, clientY: number) => [number, number] | null;
}

export function LabelLayer({ svgToLonLat }: LabelLayerProps) {
  const { t } = useTranslation();
  const territories = useTerritoriesStore((s) => s.territories);
  const updateTerritory = useTerritoriesStore((s) => s.updateTerritory);
  const dragId = useRef<string | null>(null);

  const onPointerDown = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragId.current = id;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragId.current) return;
    const lonlat = svgToLonLat(e.clientX, e.clientY);
    if (lonlat) updateTerritory(dragId.current, { labelPosition: lonlat });
  };
  const onPointerUp = () => {
    dragId.current = null;
  };

  return (
    <g className="label-layer">
      {territories.map((terr) => {
        if (!terr.visible || !terr.labelVisible) return null;
        const anchor = terr.labelPosition ?? geometryCentroid(terr.geometry);
        const [x, y] = project(anchor);
        const hasDetails = terr.labelYears || terr.labelCapital || terr.labelPopulation;

        return (
          <foreignObject key={terr.id} x={x - 80} y={y - 20} width={160} height={140} style={{ overflow: 'visible' }}>
            <div
              className="map-label-card"
              onPointerDown={onPointerDown(terr.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <div className="map-label-card__name" style={{ borderInlineStartColor: terr.strokeColor }}>
                {terr.name}
              </div>
              {hasDetails && (
                <div className="map-label-card__body">
                  {terr.labelYears && <div>{terr.labelYears}</div>}
                  {terr.labelCapital && (
                    <div>
                      {t('territory.labelCapital')}: {terr.labelCapital}
                    </div>
                  )}
                  {terr.labelPopulation && (
                    <div>
                      {t('territory.labelPopulation')}: {terr.labelPopulation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </foreignObject>
        );
      })}
    </g>
  );
}
