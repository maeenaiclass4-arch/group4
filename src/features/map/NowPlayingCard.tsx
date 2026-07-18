import { useTranslation } from 'react-i18next';
import { useActiveEventsStore } from '../playback/engine';
import { ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';

export function NowPlayingCard() {
  const { t } = useTranslation();
  const activeEvents = useActiveEventsStore((s) => s.activeEvents);

  if (activeEvents.length === 0) return null;
  const top = [...activeEvents].sort((a, b) => b.progress - a.progress)[0];
  const def = ANIMATION_TYPE_BY_ID[top.event.animationType];

  return (
    <div className="now-playing-card" style={{ borderInlineStartColor: top.event.color }}>
      <span className="now-playing-card__icon">{def.icon}</span>
      <div className="now-playing-card__body">
        <span className="now-playing-card__title">{top.event.title}</span>
        {top.event.description && <span className="now-playing-card__desc">{top.event.description}</span>}
        <span className="now-playing-card__type">{t(`animationTypes.${top.event.animationType}`)}</span>
      </div>
    </div>
  );
}
