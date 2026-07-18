import { useRef } from 'react';
import { project } from '../../lib/geo';
import type { CustomTerritory, TerritoryGeometry } from '../../types/territory';

interface VertexHandlesProps {
  territory: CustomTerritory;
  onChangeGeometry: (geometry: TerritoryGeometry) => void;
  svgToLonLat: (clientX: number, clientY: number) => [number, number] | null;
}

/** Draggable vertex + add/delete handles for a selected simple (single-ring) polygon territory. */
export function VertexHandles({ territory, onChangeGeometry, svgToLonLat }: VertexHandlesProps) {
  const dragIndex = useRef<number | null>(null);

  if (territory.geometry.type !== 'Polygon' || territory.geometry.coordinates.length !== 1) return null;

  const ring = territory.geometry.coordinates[0];
  const points = ring.slice(0, -1).map((p) => [p[0], p[1]] as [number, number]); // drop the closing duplicate point

  const commitRing = (newPoints: [number, number][]) => {
    const closed = [...newPoints, newPoints[0]];
    onChangeGeometry({ type: 'Polygon', coordinates: [closed] });
  };

  const onVertexPointerDown = (index: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragIndex.current = index;
  };

  const onVertexPointerMove = (e: React.PointerEvent) => {
    if (dragIndex.current === null) return;
    const lonlat = svgToLonLat(e.clientX, e.clientY);
    if (!lonlat) return;
    const next = points.map((p, i) => (i === dragIndex.current ? lonlat : p)) as [number, number][];
    commitRing(next);
  };

  const onVertexPointerUp = () => {
    dragIndex.current = null;
  };

  const deleteVertex = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (points.length <= 3) return;
    commitRing(points.filter((_, i) => i !== index) as [number, number][]);
  };

  const addVertexAt = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = points[index];
    const b = points[(index + 1) % points.length];
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const next = [...points.slice(0, index + 1), mid, ...points.slice(index + 1)];
    commitRing(next as [number, number][]);
  };

  return (
    <g className="vertex-handles">
      {points.map((p, i) => {
        const a = project(p);
        const b = project(points[(i + 1) % points.length]);
        const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        return (
          <g key={i}>
            <rect
              x={mid[0] - 3.5}
              y={mid[1] - 3.5}
              width={7}
              height={7}
              fill="var(--bg-elevated)"
              stroke="var(--secondary)"
              strokeWidth={1.5}
              onClick={addVertexAt(i)}
              style={{ cursor: 'copy' }}
            />
          </g>
        );
      })}
      {points.map((p, i) => {
        const [x, y] = project(p);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill="var(--bg-0)"
            stroke="var(--accent)"
            strokeWidth={2.5}
            onPointerDown={onVertexPointerDown(i)}
            onPointerMove={onVertexPointerMove}
            onPointerUp={onVertexPointerUp}
            onDoubleClick={deleteVertex(i)}
            style={{ cursor: 'grab' }}
          />
        );
      })}
    </g>
  );
}
