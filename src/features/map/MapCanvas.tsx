import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Locate, Minus, Plus } from 'lucide-react';
import { MAP_WIDTH, MAP_HEIGHT, project } from '../../lib/geo';
import { useActiveEventsStore } from '../playback/engine';
import { useCountryFills } from './useCountryFills';
import { useCameraTarget } from './useCameraTarget';
import { CountryLayer } from './CountryLayer';
import { EffectsLayer } from './EffectsLayer';
import { useMapStore } from '../../store/mapStore';
import { useUiStore } from '../../store/uiStore';
import { NowPlayingCard } from './NowPlayingCard';
import './map.css';

export function MapCanvas() {
  const { t } = useTranslation();
  const activeEvents = useActiveEventsStore((s) => s.activeEvents);
  const clock = useActiveEventsStore((s) => s.clock);
  const fillsResult = useCountryFills(activeEvents);
  const autoTarget = useCameraTarget(activeEvents);

  const autoFollow = useMapStore((s) => s.autoFollow);
  const setAutoFollow = useMapStore((s) => s.setAutoFollow);
  const manualCenter = useMapStore((s) => s.center);
  const manualZoom = useMapStore((s) => s.zoom);
  const setCamera = useMapStore((s) => s.setCamera);
  const resetCamera = useMapStore((s) => s.resetCamera);
  const pickingField = useUiStore((s) => s.pickingField);

  const { center, zoom } = autoFollow ? autoTarget : { center: manualCenter, zoom: manualZoom };
  const [px, py] = project(center);
  const tx = MAP_WIDTH / 2 - zoom * px;
  const ty = MAP_HEIGHT / 2 - zoom * py;

  const svgRef = useRef<SVGSVGElement>(null);
  const dragState = useRef<{ x: number; y: number; center: [number, number] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.88 : 1.14;
    const nextZoom = Math.min(8, Math.max(1, (autoFollow ? autoTarget.zoom : manualZoom) * factor));
    setAutoFollow(false);
    setCamera(autoFollow ? autoTarget.center : manualCenter, nextZoom);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pickingField) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = { x: e.clientX, y: e.clientY, center: autoFollow ? autoTarget.center : manualCenter };
    setIsDragging(true);
    setAutoFollow(false);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width / zoom;
    const scaleY = MAP_HEIGHT / rect.height / zoom;
    const dLon = -(e.clientX - dragState.current.x) * scaleX * 0.6;
    const dLat = (e.clientY - dragState.current.y) * scaleY * 0.6;
    setCamera([dragState.current.center[0] + dLon, dragState.current.center[1] + dLat], zoom);
  };

  const endDrag = () => {
    dragState.current = null;
    setIsDragging(false);
  };

  const zoomButton = (dir: 1 | -1) => {
    const cur = autoFollow ? autoTarget : { center: manualCenter, zoom: manualZoom };
    setAutoFollow(false);
    setCamera(cur.center, Math.min(8, Math.max(1, cur.zoom * (dir === 1 ? 1.25 : 0.8))));
  };

  return (
    <div className="map-canvas-wrap">
      <svg
        ref={svgRef}
        className={`map-canvas${isDragging ? ' map-canvas--dragging' : ''}${pickingField ? ' map-canvas--picking' : ''}`}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        role="img"
        aria-label={t('app.title')}
      >
        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--map-ocean)" />
        <motion.g
          animate={{ x: tx, y: ty, scale: zoom }}
          transition={{ type: 'spring', stiffness: 90, damping: 22, mass: 0.6 }}
          style={{ originX: 0, originY: 0, transformBox: 'view-box' }}
        >
          <CountryLayer fillsResult={fillsResult} />
          <EffectsLayer activeEvents={activeEvents} clock={clock} />
        </motion.g>
      </svg>

      <NowPlayingCard />

      {pickingField && (
        <div className="map-picking-banner">
          {t(pickingField === 'region' ? 'event.region' : 'event.targetRegion')} — انقر على دولة في الخريطة
        </div>
      )}

      <div className="map-controls">
        <button type="button" className="map-control-btn" title={t('map.zoomIn')} onClick={() => zoomButton(1)}>
          <Plus size={16} />
        </button>
        <button type="button" className="map-control-btn" title={t('map.zoomOut')} onClick={() => zoomButton(-1)}>
          <Minus size={16} />
        </button>
        <button
          type="button"
          className={`map-control-btn${autoFollow ? ' map-control-btn--active' : ''}`}
          title={t('map.autoFollow')}
          onClick={() => {
            setAutoFollow(!autoFollow);
            if (!autoFollow) resetCamera();
          }}
        >
          <Locate size={16} />
        </button>
      </div>
    </div>
  );
}
