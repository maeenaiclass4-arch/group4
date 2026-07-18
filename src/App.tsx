import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Globe2, CalendarClock, MapPinned, Shapes, Layers3 } from 'lucide-react';
import { PlaybackDriver } from './features/playback/PlaybackDriver';
import { MapCanvas } from './features/map/MapCanvas';
import { TimelineEditor } from './features/timeline/TimelineEditor';
import { EventList } from './features/events/EventList';
import { EventInspector } from './features/events/EventInspector';
import { TerritoryPanel } from './features/territories/TerritoryPanel';
import { AssetLibraryPanel } from './features/assets/AssetLibraryPanel';
import { LayersPanel } from './features/layers/LayersPanel';
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
  const leftPanelTab = useUiStore((s) => s.leftPanelTab);
  const setLeftPanelTab = useUiStore((s) => s.setLeftPanelTab);

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
            <div className="left-panel-tabs">
              <button
                type="button"
                className={`left-panel-tab${leftPanelTab === 'events' ? ' left-panel-tab--active' : ''}`}
                onClick={() => setLeftPanelTab('events')}
              >
                <CalendarClock size={14} />
                {t('nav.events')}
              </button>
              <button
                type="button"
                className={`left-panel-tab${leftPanelTab === 'territories' ? ' left-panel-tab--active' : ''}`}
                onClick={() => setLeftPanelTab('territories')}
              >
                <MapPinned size={14} />
                {t('nav.territories')}
              </button>
              <button
                type="button"
                className={`left-panel-tab${leftPanelTab === 'assets' ? ' left-panel-tab--active' : ''}`}
                onClick={() => setLeftPanelTab('assets')}
              >
                <Shapes size={14} />
                {t('nav.assets')}
              </button>
              <button
                type="button"
                className={`left-panel-tab${leftPanelTab === 'layers' ? ' left-panel-tab--active' : ''}`}
                onClick={() => setLeftPanelTab('layers')}
              >
                <Layers3 size={14} />
                {t('nav.layers')}
              </button>
            </div>
            {leftPanelTab === 'events' && <EventList />}
            {leftPanelTab === 'territories' && <TerritoryPanel />}
            {leftPanelTab === 'assets' && <AssetLibraryPanel />}
            {leftPanelTab === 'layers' && <LayersPanel />}
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
