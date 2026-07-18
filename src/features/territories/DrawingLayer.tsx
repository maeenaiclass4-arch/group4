import { project } from '../../lib/geo';

interface DrawingLayerProps {
  points: [number, number][];
  cursor: [number, number] | null;
}

/** Renders the in-progress polygon while the "Draw Territory" tool is active. */
export function DrawingLayer({ points, cursor }: DrawingLayerProps) {
  if (points.length === 0) return null;

  const projected = points.map((p) => project(p));
  const cursorProjected = cursor ? project(cursor) : null;

  const linePoints = cursorProjected ? [...projected, cursorProjected] : projected;
  const pathD = linePoints.reduce((d, [x, y], i) => d + `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`, '');

  return (
    <g className="drawing-layer" pointerEvents="none">
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" />
      {projected.length >= 3 && (
        <path d={pathD + ' Z'} fill="var(--accent)" fillOpacity={0.12} stroke="none" />
      )}
      {projected.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="var(--bg-0)" stroke="var(--accent)" strokeWidth={2} />
      ))}
    </g>
  );
}
