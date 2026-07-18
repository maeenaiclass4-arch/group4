import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Globe2 } from 'lucide-react';
import { PlaybackDriver } from './features/playback/PlaybackDriver';
import { MapCanvas } from './features/map/MapCanvas';
import { TimelineEditor } from './features/timeline/TimelineEditor';
import { EventList } from './features/events/EventList';
import { EventInspector } from './features/events/EventInspector';
import { useUiStore } from './store/uiStore';
import { useLanguage } from './hooks/useLanguage';
import './App.css';

function App() {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const inspectorOpen = useUiStore((s) => s.inspectorOpen);
  const eventListOpen = useUiStore((s) => s.eventListOpen);
  const toggleInspector = useUiStore((s) => s.toggleInspector);
  const toggleEventList = useUiStore((s) => s.toggleEventList);

  return (
    <div className="studio">
      <PlaybackDriver />

      <header className="studio-header">
        <div className="studio-header__brand">
          <span className="studio-header__logo">🗺️</span>
          <div>
            <h1 className="studio-header__title">{t('app.title')}</h1>
            <p className="studio-header__subtitle">{t('app.subtitle')}</p>
          </div>
        </div>

        <div className="studio-header__actions">
          <button type="button" className="btn" onClick={toggleLanguage}>
            <Globe2 size={14} />
            {t('nav.language')}
          </button>
          <button type="button" className="btn studio-header__panel-toggle" onClick={toggleEventList} title={t('nav.events')}>
            {eventListOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <button type="button" className="btn studio-header__panel-toggle" onClick={toggleInspector} title={t('nav.inspector')}>
            {inspectorOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </header>

      <div className="studio-body">
        {eventListOpen && (
          <aside className="studio-panel studio-panel--left">
            <EventList />
          </aside>
        )}

        <main className="studio-main">
          <div className="studio-main__map">
            <MapCanvas />
          </div>
          <div className="studio-main__timeline">
            <TimelineEditor />
          </div>
        </main>

        {inspectorOpen && (
          <aside className="studio-panel studio-panel--right">
            <EventInspector />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
