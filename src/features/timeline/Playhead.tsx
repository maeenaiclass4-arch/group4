import { useRef } from 'react';
import { usePlaybackStore } from '../../store/playbackStore';
import { yearToPercent, percentToYear } from './timelineUtils';

interface PlayheadProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export function Playhead({ containerRef }: PlayheadProps) {
  const currentYear = usePlaybackStore((s) => s.currentYear);
  const viewStartYear = usePlaybackStore((s) => s.viewStartYear);
  const viewEndYear = usePlaybackStore((s) => s.viewEndYear);
  const seek = usePlaybackStore((s) => s.seek);
  const dragging = useRef(false);

  const percent = yearToPercent(currentYear, viewStartYear, viewEndYear);

  const updateFromClientX = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    seek(percentToYear(Math.min(100, Math.max(0, p)), viewStartYear, viewEndYear));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  if (percent < 0 || percent > 100) return null;

  return (
    <div className="timeline-playhead" style={{ insetInlineStart: `${percent}%` }}>
      <div
        className="timeline-playhead__handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <div className="timeline-playhead__line" />
    </div>
  );
}
