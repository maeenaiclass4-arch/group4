import { useRef } from 'react';
import type { HistoricalEvent } from '../../types/event';
import { ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';
import { yearToPercent } from './timelineUtils';
import { useEventsStore } from '../../store/eventsStore';
import { usePlaybackStore, TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR } from '../../store/playbackStore';

interface EventClipProps {
  event: HistoricalEvent;
  trackAreaRef: React.RefObject<HTMLElement | null>;
}

type DragMode = 'move' | 'resize-start' | 'resize-end';

const CLICK_THRESHOLD_PX = 4;

export function EventClip({ event, trackAreaRef }: EventClipProps) {
  const viewStartYear = usePlaybackStore((s) => s.viewStartYear);
  const viewEndYear = usePlaybackStore((s) => s.viewEndYear);
  const selectedEventId = useEventsStore((s) => s.selectedEventId);
  const selectEvent = useEventsStore((s) => s.selectEvent);
  const updateEvent = useEventsStore((s) => s.updateEvent);

  const def = ANIMATION_TYPE_BY_ID[event.animationType];
  const isPoint = event.endYear === undefined;
  const isSelected = selectedEventId === event.id;

  const drag = useRef<{
    mode: DragMode;
    startClientX: number;
    startYear: number;
    endYear: number;
    moved: boolean;
  } | null>(null);

  const yearsPerPixel = () => {
    const el = trackAreaRef.current;
    const width = el?.getBoundingClientRect().width ?? 1;
    return (viewEndYear - viewStartYear) / width;
  };

  const beginDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = {
      mode,
      startClientX: e.clientX,
      startYear: event.startYear,
      endYear: event.endYear ?? event.startYear,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const deltaPx = e.clientX - drag.current.startClientX;
    if (Math.abs(deltaPx) > CLICK_THRESHOLD_PX) drag.current.moved = true;
    const deltaYears = Math.round(deltaPx * yearsPerPixel());
    if (deltaYears === 0) return;

    const { mode, startYear, endYear } = drag.current;
    if (mode === 'move') {
      const span = endYear - startYear;
      let newStart = startYear + deltaYears;
      newStart = Math.max(TIMELINE_MIN_YEAR, Math.min(TIMELINE_MAX_YEAR - span, newStart));
      updateEvent(event.id, {
        startYear: newStart,
        endYear: isPoint ? undefined : newStart + span,
      });
    } else if (mode === 'resize-start') {
      const newStart = Math.max(TIMELINE_MIN_YEAR, Math.min(endYear - 1, startYear + deltaYears));
      updateEvent(event.id, { startYear: newStart });
    } else if (mode === 'resize-end') {
      const newEnd = Math.min(TIMELINE_MAX_YEAR, Math.max(startYear + 1, endYear + deltaYears));
      updateEvent(event.id, { endYear: newEnd });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const wasClickOnly = !drag.current.moved;
    drag.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (wasClickOnly) selectEvent(event.id);
  };

  const left = yearToPercent(event.startYear, viewStartYear, viewEndYear);
  const right = yearToPercent(isPoint ? event.startYear : event.endYear!, viewStartYear, viewEndYear);
  const width = Math.max(isPoint ? 0 : right - left, 0.3);

  if (isPoint) {
    return (
      <div
        className={`event-marker${isSelected ? ' event-marker--selected' : ''}`}
        style={{ insetInlineStart: `${left}%`, borderColor: event.color, background: event.color }}
        onPointerDown={beginDrag('move')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title={event.title}
      >
        <span className="event-marker__icon">{def.icon}</span>
        <span className="event-marker__label">{event.title}</span>
      </div>
    );
  }

  return (
    <div
      className={`event-clip${isSelected ? ' event-clip--selected' : ''}`}
      style={{
        insetInlineStart: `${left}%`,
        width: `${width}%`,
        background: `${event.color}33`,
        borderColor: event.color,
      }}
      onPointerDown={beginDrag('move')}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="event-clip__handle event-clip__handle--start" onPointerDown={beginDrag('resize-start')} />
      <span className="event-clip__icon">{def.icon}</span>
      <span className="event-clip__label">{event.title}</span>
      <div className="event-clip__handle event-clip__handle--end" onPointerDown={beginDrag('resize-end')} />
    </div>
  );
}
