import { project } from '../../lib/geo';

interface DrawingLayerProps {
  points: [number, number][];
  cursor: [number, number] | null;
  /** true for the polygon pen tool (fills a preview), false for an open cutting line (split tool). */
  closed?: boolean;
  color?: string;
}

/** Renders the in-progress shape while the "Draw Territory" or "Split" tool is active. */
export function DrawingLayer({ points, cursor, closed = true, color }: DrawingLayerProps) {
  if (points.length === 0) return null;

  const strokeColor = color ?? (closed ? 'var(--accent)' : 'var(--secondary)');
  const projected = points.map((p) => project(p));
  const cursorProjected = cursor ? project(cursor) : null;

  const linePoints = cursorProjected ? [...projected, cursorProjected] : projected;
  const pathD = linePoints.reduce((d, [x, y], i) => d + `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`, '');

  return (
    <g className="drawing-layer" pointerEvents="none">
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeDasharray="4 3" />
      {closed && projected.length >= 3 && <path d={pathD + ' Z'} fill={strokeColor} fillOpacity={0.12} stroke="none" />}
      {projected.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="var(--bg-0)" stroke={strokeColor} strokeWidth={2} />
      ))}
    </g>
  );
}
