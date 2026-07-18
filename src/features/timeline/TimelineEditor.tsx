import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { usePlaybackStore } from '../../store/playbackStore';
import { useEventsStore } from '../../store/eventsStore';
import { TransportControls } from './TransportControls';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrack } from './TimelineTrack';
import { Playhead } from './Playhead';
import './timeline.css';

export function TimelineEditor() {
  const { t } = useTranslation();
  const tracks = useEventsStore((s) => s.tracks);
  const events = useEventsStore((s) => s.events);
  const removeTrack = useEventsStore((s) => s.removeTrack);
  const zoom = usePlaybackStore((s) => s.zoom);
  const pan = usePlaybackStore((s) => s.pan);
  const viewStartYear = usePlaybackStore((s) => s.viewStartYear);
  const viewEndYear = usePlaybackStore((s) => s.viewEndYear);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.shiftKey) {
      pan(((viewEndYear - viewStartYear) * e.deltaY) / 800);
    } else {
      zoom(e.deltaY > 0 ? 1.12 : 0.89);
    }
  };

  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

  return (
    <div className="timeline-editor">
      <TransportControls />
      <div className="timeline-body">
        <div className="timeline-track-names">
          <div className="timeline-track-names__spacer" />
          {sortedTracks.map((track) => (
            <div key={track.id} className="timeline-track-name" style={{ borderInlineStartColor: track.color }}>
              <span>{t(`track.${track.name}`, { defaultValue: track.name })}</span>
              <button
                type="button"
                className="timeline-track-name__remove"
                title={t('timeline.deleteTrack')}
                onClick={() => removeTrack(track.id)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="timeline-scroll-area" ref={scrollAreaRef} onWheel={handleWheel}>
          <TimelineRuler />
          <div className="timeline-tracks">
            {sortedTracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                events={events.filter((e) => e.trackId === track.id)}
                trackAreaRef={scrollAreaRef}
              />
            ))}
            {sortedTracks.length === 0 && <div className="timeline-empty">{t('timeline.trackPlaceholder')}</div>}
          </div>
          <Playhead containerRef={scrollAreaRef} />
        </div>
      </div>
    </div>
  );
}
