import { useRef } from 'react';
import { useCameraKeyframesStore } from '../../store/cameraKeyframesStore';
import { usePlaybackStore, TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR } from '../../store/playbackStore';
import { yearToPercent } from './timelineUtils';

const CLICK_THRESHOLD_PX = 4;

export function CameraTrack() {
  const keyframes = useCameraKeyframesStore((s) => s.keyframes);
  const selectedKeyframeId = useCameraKeyframesStore((s) => s.selectedKeyframeId);
  const selectKeyframe = useCameraKeyframesStore((s) => s.selectKeyframe);
  const updateKeyframe = useCameraKeyframesStore((s) => s.updateKeyframe);
  const viewStartYear = usePlaybackStore((s) => s.viewStartYear);
  const viewEndYear = usePlaybackStore((s) => s.viewEndYear);
  const seek = usePlaybackStore((s) => s.seek);

  const drag = useRef<{ id: string; startClientX: number; startYear: number; moved: boolean } | null>(null);

  const yearsPerPixel = (trackEl: HTMLElement | null) => {
    const width = trackEl?.getBoundingClientRect().width ?? 1;
    return (viewEndYear - viewStartYear) / width;
  };

  const onPointerDown = (id: string, year: number) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id, startClientX: e.clientX, startYear: year, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const deltaPx = e.clientX - drag.current.startClientX;
    if (Math.abs(deltaPx) > CLICK_THRESHOLD_PX) drag.current.moved = true;
    const deltaYears = Math.round(deltaPx * yearsPerPixel(e.currentTarget));
    const newYear = Math.max(TIMELINE_MIN_YEAR, Math.min(TIMELINE_MAX_YEAR, drag.current.startYear + deltaYears));
    updateKeyframe(drag.current.id, { year: newYear });
  };

  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) {
      selectKeyframe(drag.current.id);
      seek(drag.current.startYear);
    }
    drag.current = null;
  };

  return (
    <div className="camera-track__lane" onPointerMove={onPointerMove}>
      {keyframes.map((kf) => (
        <div
          key={kf.id}
          className={`camera-keyframe${kf.id === selectedKeyframeId ? ' camera-keyframe--selected' : ''}`}
          style={{ insetInlineStart: `${yearToPercent(kf.year, viewStartYear, viewEndYear)}%` }}
          onPointerDown={onPointerDown(kf.id, kf.year)}
          onPointerUp={onPointerUp}
          title={`${kf.year}`}
        />
      ))}
    </div>
  );
}
