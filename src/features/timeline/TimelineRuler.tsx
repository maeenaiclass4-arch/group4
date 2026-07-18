import { useTranslation } from 'react-i18next';
import { usePlaybackStore } from '../../store/playbackStore';
import { yearToPercent, percentToYear, formatYear, pickTickInterval } from './timelineUtils';

export function TimelineRuler() {
  const { t } = useTranslation();
  const viewStartYear = usePlaybackStore((s) => s.viewStartYear);
  const viewEndYear = usePlaybackStore((s) => s.viewEndYear);
  const seek = usePlaybackStore((s) => s.seek);

  const span = viewEndYear - viewStartYear;
  const interval = pickTickInterval(span);
  const firstTick = Math.ceil(viewStartYear / interval) * interval;
  const ticks: number[] = [];
  for (let y = firstTick; y <= viewEndYear; y += interval) ticks.push(y);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seek(percentToYear(percent, viewStartYear, viewEndYear));
  };

  return (
    <div className="timeline-ruler" onClick={handleClick}>
      {ticks.map((y) => (
        <div key={y} className="timeline-ruler__tick" style={{ insetInlineStart: `${yearToPercent(y, viewStartYear, viewEndYear)}%` }}>
          <span className="timeline-ruler__label">{formatYear(y, t)}</span>
        </div>
      ))}
    </div>
  );
}
