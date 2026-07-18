import type { ActiveEvent } from '../playback/engine';
import { ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';
import { getRegionCentroid, resolveCountryIds } from '../../data/historicalRegions';
import { COUNTRY_BY_ID } from '../../data/countries';
import { project, buildArcPath, sampleArcPoints } from '../../lib/geo';
import { withAlpha } from '../../lib/color';

interface EffectsLayerProps {
  activeEvents: ActiveEvent[];
  clock: number;
}

function regionAnchor(regionId: string | undefined): [number, number] | null {
  if (!regionId) return null;
  const centroid = getRegionCentroid(regionId);
  if (centroid) return centroid;
  const ids = resolveCountryIds(regionId);
  const first = ids[0] ? COUNTRY_BY_ID[ids[0]] : undefined;
  return first?.centroid ?? null;
}

export function EffectsLayer({ activeEvents, clock }: EffectsLayerProps) {
  const pulse = Math.sin(clock / 420) * 0.5 + 0.5;

  return (
    <g className="effects-layer" pointerEvents="none">
      {activeEvents.map(({ event, progress, rawT }) => {
        const def = ANIMATION_TYPE_BY_ID[event.animationType];
        const from = regionAnchor(event.region);
        const key = event.id;

        if (def.kind === 'fill') {
          if (!from) return null;
          const [x, y] = project(from);
          return (
            <g key={key}>
              <circle cx={x} cy={y} r={6 + progress * 16} fill="none" stroke={event.color} strokeWidth={2} opacity={(1 - progress) * 0.9} />
              <circle cx={x} cy={y} r={5} fill={event.color} opacity={0.5 + progress * 0.5} />
            </g>
          );
        }

        if (def.kind === 'spread') {
          if (!from) return null;
          const [x, y] = project(from);
          return (
            <g key={key}>
              <circle cx={x} cy={y} r={4 + rawT * 10} fill={event.color} opacity={0.35 + pulse * 0.25} />
              <circle cx={x} cy={y} r={4} fill={event.color} />
            </g>
          );
        }

        if (def.kind === 'collapse') {
          if (!from) return null;
          const [x, y] = project(from);
          return (
            <g key={key}>
              <circle
                cx={x}
                cy={y}
                r={14 - rawT * 8}
                fill="none"
                stroke={withAlpha('#8a7a5f', 0.7)}
                strokeDasharray="3 4"
                strokeWidth={2}
                opacity={0.8}
              />
            </g>
          );
        }

        if (def.kind === 'arrow') {
          const to = regionAnchor(event.targetRegion) ?? from;
          if (!from || !to) return null;
          const path = buildArcPath(from, to);
          const points = sampleArcPoints(from, to, 80);
          const idx = Math.min(points.length - 1, Math.round(progress * (points.length - 1)));
          const [mx, my] = points[idx];
          const [tx, ty] = points[points.length - 1];
          const [sx, sy] = points[0];
          const impact = event.animationType === 'conquest' || event.animationType === 'battle';

          return (
            <g key={key}>
              <path
                d={path}
                fill="none"
                stroke={withAlpha(event.color, 0.85)}
                strokeWidth={2.25}
                strokeDasharray="1000"
                strokeDashoffset={1000 - progress * 1000}
                markerEnd={`url(#arrowhead-${event.id})`}
              />
              <defs>
                <marker id={`arrowhead-${event.id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill={event.color} />
                </marker>
              </defs>
              <circle cx={sx} cy={sy} r={3.5} fill={event.color} opacity={0.9} />
              {progress < 1 && <circle cx={mx} cy={my} r={5} fill={event.color} opacity={0.95} />}
              {impact && progress > 0.8 && (
                <circle cx={tx} cy={ty} r={6 + (progress - 0.8) * 40} fill={event.color} opacity={(1 - (progress - 0.8) / 0.2) * 0.6} />
              )}
            </g>
          );
        }

        if (def.kind === 'connection') {
          const to = regionAnchor(event.targetRegion) ?? from;
          if (!from || !to) return null;
          const path = buildArcPath(from, to);
          const points = sampleArcPoints(from, to, 2);
          const [mx, my] = points[1];
          return (
            <g key={key}>
              <path
                d={path}
                fill="none"
                stroke={withAlpha(event.color, 0.55 + pulse * 0.25)}
                strokeWidth={1.75}
                strokeDasharray="6 5"
                opacity={Math.min(1, progress * 1.6)}
              />
              <circle cx={mx} cy={my} r={4 + pulse * 2} fill={event.color} opacity={0.65} />
            </g>
          );
        }

        return null;
      })}
    </g>
  );
}
