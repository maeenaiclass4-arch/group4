import { useTranslation } from 'react-i18next';
import { Play, Pause, ZoomIn, ZoomOut, SkipBack, SkipForward, Maximize2, Plus } from 'lucide-react';
import { usePlaybackStore, TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR } from '../../store/playbackStore';
import { useEventsStore } from '../../store/eventsStore';
import { formatYear } from './timelineUtils';

const SPEED_OPTIONS = [5, 10, 20, 50, 100, 250];

export function TransportControls() {
  const { t } = useTranslation();
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const toggle = usePlaybackStore((s) => s.toggle);
  const currentYear = usePlaybackStore((s) => s.currentYear);
  const seek = usePlaybackStore((s) => s.seek);
  const yearsPerSecond = usePlaybackStore((s) => s.yearsPerSecond);
  const setYearsPerSecond = usePlaybackStore((s) => s.setYearsPerSecond);
  const zoom = usePlaybackStore((s) => s.zoom);
  const setView = usePlaybackStore((s) => s.setView);
  const viewStartYear = usePlaybackStore((s) => s.viewStartYear);
  const viewEndYear = usePlaybackStore((s) => s.viewEndYear);
  const addTrack = useEventsStore((s) => s.addTrack);
  const events = useEventsStore((s) => s.events);

  const fitAll = () => {
    if (events.length === 0) {
      setView(TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR);
      return;
    }
    const starts = events.map((e) => e.startYear);
    const ends = events.map((e) => e.endYear ?? e.startYear);
    const min = Math.min(...starts);
    const max = Math.max(...ends);
    const pad = Math.max(10, (max - min) * 0.08);
    setView(min - pad, max + pad);
  };

  return (
    <div className="transport-controls">
      <div className="transport-controls__group">
        <button type="button" className="transport-btn" onClick={() => seek(viewStartYear)} title={t('timeline.jumpToStart')}>
          <SkipBack size={16} />
        </button>
        <button type="button" className="transport-btn transport-btn--primary" onClick={toggle} title={t(isPlaying ? 'timeline.pause' : 'timeline.play')}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type="button" className="transport-btn" onClick={() => seek(viewEndYear)} title={t('timeline.jumpToEnd')}>
          <SkipForward size={16} />
        </button>
      </div>

      <div className="transport-controls__year">
        <input
          type="number"
          className="transport-year-input"
          value={Math.round(currentYear)}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <span className="transport-year-label">{formatYear(currentYear, t)}</span>
      </div>

      <div className="transport-controls__group">
        <label className="transport-speed-label">
          {t('timeline.speed')}
          <select
            className="transport-speed-select"
            value={yearsPerSecond}
            onChange={(e) => setYearsPerSecond(Number(e.target.value))}
          >
            {SPEED_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v} {t('common.years')}/s
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="transport-controls__group">
        <button type="button" className="transport-btn" onClick={() => zoom(1.3)} title={t('timeline.zoomOut')}>
          <ZoomOut size={16} />
        </button>
        <button type="button" className="transport-btn" onClick={() => zoom(0.7)} title={t('timeline.zoomIn')}>
          <ZoomIn size={16} />
        </button>
        <button type="button" className="transport-btn" onClick={fitAll} title={t('timeline.fitAll')}>
          <Maximize2 size={16} />
        </button>
        <button type="button" className="transport-btn" onClick={() => addTrack(t('timeline.addTrack'))} title={t('timeline.addTrack')}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
