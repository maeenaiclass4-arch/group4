import type { Track, HistoricalEvent } from '../../types/event';
import { EventClip } from './EventClip';

interface TimelineTrackProps {
  track: Track;
  events: HistoricalEvent[];
  trackAreaRef: React.RefObject<HTMLElement | null>;
}

export function TimelineTrack({ track, events, trackAreaRef }: TimelineTrackProps) {
  return (
    <div className="timeline-track" data-track-id={track.id}>
      {events.map((event) => (
        <EventClip key={event.id} event={event} trackAreaRef={trackAreaRef} />
      ))}
    </div>
  );
}
