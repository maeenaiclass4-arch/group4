import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Trash2 } from 'lucide-react';
import { useEventsStore } from '../../store/eventsStore';
import { useUiStore } from '../../store/uiStore';
import { useTerritoriesStore } from '../../store/territoriesStore';
import { ANIMATION_TYPES, ANIMATION_TYPE_BY_ID } from '../../data/animationTypes';
import { getAllRegionOptions, isHistoricalRegion } from '../../data/historicalRegions';
import { ComboBox, type ComboBoxOption } from '../../components/ui/ComboBox';
import { ColorPicker } from '../../components/ui/ColorPicker';
import type { AnimationTypeId } from '../../types/event';
import './events.css';

export function EventInspector() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const selectedEventId = useEventsStore((s) => s.selectedEventId);
  const events = useEventsStore((s) => s.events);
  const tracks = useEventsStore((s) => s.tracks);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const removeEvent = useEventsStore((s) => s.removeEvent);
  const selectEvent = useEventsStore((s) => s.selectEvent);
  const pickingField = useUiStore((s) => s.pickingField);
  const setPickingField = useUiStore((s) => s.setPickingField);

  const event = events.find((e) => e.id === selectedEventId);
  const territories = useTerritoriesStore((s) => s.territories);

  const regionOptions: ComboBoxOption[] = useMemo(() => {
    const territoryOptions: ComboBoxOption[] = territories.map((terr) => ({
      value: terr.id,
      label: terr.name,
      meta: t('territory.customTerritory'),
    }));
    const builtInOptions: ComboBoxOption[] = getAllRegionOptions().map((r) => ({
      value: r.id,
      label: lang === 'ar' ? r.nameAr : r.nameEn,
      meta: isHistoricalRegion(r) ? (lang === 'ar' ? 'تاريخي' : 'historical') : undefined,
    }));
    return [...territoryOptions, ...builtInOptions];
  }, [lang, territories]);

  if (!event) {
    return (
      <div className="inspector inspector--empty">
        <p>{t('event.noSelection')}</p>
      </div>
    );
  }

  const def = ANIMATION_TYPE_BY_ID[event.animationType];
  const hasEndYear = event.endYear !== undefined;

  return (
    <div className="inspector">
      <div className="inspector__scroll">
        <div className="field">
          <label className="field__label">{t('event.title')}</label>
          <input
            className="text-input"
            value={event.title}
            placeholder={t('event.titlePlaceholder')}
            onChange={(e) => updateEvent(event.id, { title: e.target.value })}
          />
        </div>

        <div className="field">
          <label className="field__label">{t('event.description')}</label>
          <textarea
            className="textarea-input"
            value={event.description}
            placeholder={t('event.descriptionPlaceholder')}
            onChange={(e) => updateEvent(event.id, { description: e.target.value })}
          />
        </div>

        <div className="field__row">
          <div className="field">
            <label className="field__label">{t('event.startYear')}</label>
            <input
              type="number"
              className="number-input"
              value={event.startYear}
              onChange={(e) => updateEvent(event.id, { startYear: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label className="field__label">
              {t('event.endYear')} <span className="field__optional">({t('event.endYearOptional')})</span>
            </label>
            <div className="end-year-row">
              <input
                type="number"
                className="number-input"
                disabled={!hasEndYear}
                value={event.endYear ?? event.startYear}
                onChange={(e) => updateEvent(event.id, { endYear: Number(e.target.value) })}
              />
              <input
                type="checkbox"
                checked={hasEndYear}
                onChange={(e) => updateEvent(event.id, { endYear: e.target.checked ? event.startYear + 10 : undefined })}
                title={t('event.endYearOptional')}
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label className="field__label">{t('event.animationType')}</label>
          <div className="anim-type-grid">
            {ANIMATION_TYPES.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`anim-type-option${event.animationType === a.id ? ' anim-type-option--active' : ''}`}
                onClick={() => updateEvent(event.id, { animationType: a.id as AnimationTypeId, color: a.defaultColor })}
              >
                <span className="anim-type-option__icon">{a.icon}</span>
                <span>{lang === 'ar' ? a.labelAr : a.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field__label">{t('event.region')}</label>
          <div className="picker-row">
            <ComboBox options={regionOptions} value={event.region} onChange={(v) => updateEvent(event.id, { region: v })} placeholder={t('event.regionPlaceholder')} />
            <button
              type="button"
              className={`btn map-pick-btn${pickingField === 'region' ? ' map-pick-btn--active' : ''}`}
              title={t('event.region')}
              onClick={() => setPickingField(pickingField === 'region' ? null : 'region')}
            >
              <MapPin size={14} />
            </button>
          </div>
        </div>

        {def.usesTarget && (
          <div className="field">
            <label className="field__label">{t('event.targetRegion')}</label>
            <div className="picker-row">
              <ComboBox
                options={regionOptions}
                value={event.targetRegion}
                onChange={(v) => updateEvent(event.id, { targetRegion: v })}
                placeholder={t('event.targetRegionPlaceholder')}
                allowClear
              />
              <button
                type="button"
                className={`btn map-pick-btn${pickingField === 'targetRegion' ? ' map-pick-btn--active' : ''}`}
                title={t('event.targetRegion')}
                onClick={() => setPickingField(pickingField === 'targetRegion' ? null : 'targetRegion')}
              >
                <MapPin size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="field">
          <label className="field__label">{t('event.track')}</label>
          <select className="text-input" value={event.trackId} onChange={(e) => updateEvent(event.id, { trackId: e.target.value })}>
            {tracks.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {t(`track.${tr.name}`, { defaultValue: tr.name })}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label">{t('event.color')}</label>
          <ColorPicker value={event.color} onChange={(c) => updateEvent(event.id, { color: c })} />
        </div>

        <div className="field__row">
          <div className="field">
            <label className="field__label">
              {t('event.duration')}: {event.duration}s
            </label>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={event.duration}
              onChange={(e) => updateEvent(event.id, { duration: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label className="field__label">
              {t('event.speed')}: {event.speed}x
            </label>
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={event.speed}
              onChange={(e) => updateEvent(event.id, { speed: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="inspector__footer">
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => {
            if (confirm(t('event.confirmDelete'))) {
              removeEvent(event.id);
              selectEvent(null);
            }
          }}
        >
          <Trash2 size={14} />
          {t('event.delete')}
        </button>
      </div>
    </div>
  );
}
