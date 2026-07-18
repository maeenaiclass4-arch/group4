import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import { useEventsStore } from '../../store/eventsStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';
import { resolveRegionName } from '../../lib/regions';
import { formatYear } from '../timeline/timelineUtils';
import './events.css';

export function EventList() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const events = useEventsStore((s) => s.events);
  const tracks = useEventsStore((s) => s.tracks);
  const selectedEventId = useEventsStore((s) => s.selectedEventId);
  const selectEvent = useEventsStore((s) => s.selectEvent);
  const addEvent = useEventsStore((s) => s.addEvent);
  const currentYear = usePlaybackStore((s) => s.currentYear);
  const seek = usePlaybackStore((s) => s.seek);
  const [query, setQuery] = useState('');

  const sorted = useMemo(() => {
    const list = query
      ? events.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase()))
      : events;
    return [...list].sort((a, b) => a.startYear - b.startYear);
  }, [events, query]);

  const handleCreate = () => {
    const id = addEvent({
      trackId: tracks[0]?.id ?? 'track_political',
      title: '',
      description: '',
      startYear: Math.round(currentYear),
      endYear: undefined,
      region: '682',
      animationType: 'battle',
      color: ANIMATION_TYPE_BY_ID.battle.defaultColor,
      duration: 3,
      speed: 1,
    });
    selectEvent(id);
  };

  return (
    <div className="event-list">
      <div className="event-list__header">
        <div className="event-list__search">
          <Search size={13} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('event.searchPlaceholder')} />
        </div>
        <button type="button" className="btn btn--primary btn--block" onClick={handleCreate}>
          <Plus size={14} />
          {t('nav.newEvent')}
        </button>
      </div>

      <div className="event-list__scroll">
        {sorted.length === 0 && <div className="event-list__empty">{t('event.empty')}</div>}
        {sorted.map((event) => {
          const def = ANIMATION_TYPE_BY_ID[event.animationType];
          return (
            <button
              key={event.id}
              type="button"
              className={`event-list-item${selectedEventId === event.id ? ' event-list-item--active' : ''}`}
              style={{ borderInlineStartColor: event.color }}
              onClick={() => {
                selectEvent(event.id);
                seek(event.startYear);
              }}
            >
              <span className="event-list-item__icon">{def.icon}</span>
              <span className="event-list-item__body">
                <span className="event-list-item__title">{event.title || t('event.titlePlaceholder')}</span>
                <span className="event-list-item__meta">
                  {formatYear(event.startYear, t)}
                  {event.endYear !== undefined ? ` – ${formatYear(event.endYear, t)}` : ''} · {resolveRegionName(event.region, lang)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
