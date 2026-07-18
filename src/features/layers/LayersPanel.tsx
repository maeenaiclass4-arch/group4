import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown, Map as MapIcon, Camera as CameraIcon, Plus } from 'lucide-react';
import { useTerritoriesStore } from '../../store/territoriesStore';
import { useAssetsStore } from '../../store/assetsStore';
import { useMapStore } from '../../store/mapStore';
import { useCameraKeyframesStore } from '../../store/cameraKeyframesStore';
import { usePlaybackStore } from '../../store/playbackStore';
import { ASSET_DEF_BY_KIND } from '../../data/assets';
import { TankGlyph } from '../assets/TankGlyph';
import { formatYear } from '../timeline/timelineUtils';
import './layers.css';

export function LayersPanel() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';

  const baseMapVisible = useMapStore((s) => s.baseMapVisible);
  const toggleBaseMapVisible = useMapStore((s) => s.toggleBaseMapVisible);

  const territories = useTerritoriesStore((s) => s.territories);
  const selectedTerritoryId = useTerritoriesStore((s) => s.selectedTerritoryId);
  const selectTerritory = useTerritoriesStore((s) => s.selectTerritory);
  const updateTerritory = useTerritoriesStore((s) => s.updateTerritory);
  const removeTerritory = useTerritoriesStore((s) => s.removeTerritory);
  const toggleTerritoryVisibility = useTerritoriesStore((s) => s.toggleVisibility);
  const toggleTerritoryLock = useTerritoriesStore((s) => s.toggleLock);
  const duplicateTerritory = useTerritoriesStore((s) => s.duplicateTerritory);
  const moveTerritory = useTerritoriesStore((s) => s.moveTerritory);
  const sortedTerritories = [...territories].sort((a, b) => b.order - a.order);

  const assets = useAssetsStore((s) => s.assets);
  const selectedAssetId = useAssetsStore((s) => s.selectedAssetId);
  const selectAsset = useAssetsStore((s) => s.selectAsset);
  const removeAsset = useAssetsStore((s) => s.removeAsset);
  const toggleAssetVisibility = useAssetsStore((s) => s.toggleVisibility);
  const toggleAssetLock = useAssetsStore((s) => s.toggleLock);
  const duplicateAsset = useAssetsStore((s) => s.duplicateAsset);
  const moveAsset = useAssetsStore((s) => s.moveAsset);
  const sortedAssets = [...assets].sort((a, b) => b.order - a.order);

  const keyframes = useCameraKeyframesStore((s) => s.keyframes);
  const selectedKeyframeId = useCameraKeyframesStore((s) => s.selectedKeyframeId);
  const selectKeyframe = useCameraKeyframesStore((s) => s.selectKeyframe);
  const updateKeyframe = useCameraKeyframesStore((s) => s.updateKeyframe);
  const removeKeyframe = useCameraKeyframesStore((s) => s.removeKeyframe);
  const addKeyframe = useCameraKeyframesStore((s) => s.addKeyframe);
  const sortedKeyframes = [...keyframes].sort((a, b) => a.year - b.year);
  const selectedKeyframe = keyframes.find((k) => k.id === selectedKeyframeId);

  const currentYear = usePlaybackStore((s) => s.currentYear);
  const seek = usePlaybackStore((s) => s.seek);
  const mapCenter = useMapStore((s) => s.center);
  const mapZoom = useMapStore((s) => s.zoom);

  return (
    <div className="layers-panel">
      <div className="layers-group">
        <div className="layers-group__header">{t('layers.background')}</div>
        <div className="layer-row layer-row--static">
          <span className="layer-row__icon">
            <MapIcon size={13} />
          </span>
          <span className="layer-row__name">{t('layers.mapCountries')}</span>
          <span className="layer-row__actions">
            <button type="button" onClick={toggleBaseMapVisible} title={t('territory.toggleVisibility')}>
              {baseMapVisible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          </span>
        </div>
      </div>

      <div className="layers-group">
        <div className="layers-group__header">
          {t('layers.territories')} ({territories.length})
        </div>
        {sortedTerritories.length === 0 && <div className="layers-group__empty">{t('territory.empty')}</div>}
        {sortedTerritories.map((terr, i) => (
          <div
            key={terr.id}
            className={`layer-row${terr.id === selectedTerritoryId ? ' layer-row--active' : ''}`}
            onClick={() => selectTerritory(terr.id === selectedTerritoryId ? null : terr.id)}
          >
            <span className="layer-row__swatch" style={{ background: terr.fillColor }} />
            <input
              className="layer-row__rename"
              value={terr.name}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateTerritory(terr.id, { name: e.target.value })}
            />
            <span className="layer-row__actions">
              <button type="button" onClick={(e) => { e.stopPropagation(); moveTerritory(terr.id, 'up'); }} disabled={i === 0} title={t('territory.moveUp')}>
                <ChevronUp size={12} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); moveTerritory(terr.id, 'down'); }} disabled={i === sortedTerritories.length - 1} title={t('territory.moveDown')}>
                <ChevronDown size={12} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleTerritoryVisibility(terr.id); }} title={t('territory.toggleVisibility')}>
                {terr.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleTerritoryLock(terr.id); }} title={t('territory.toggleLock')}>
                {terr.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); duplicateTerritory(terr.id); }} title={t('territory.duplicate')}>
                <Copy size={12} />
              </button>
              <button type="button" className="layer-row__delete" onClick={(e) => { e.stopPropagation(); removeTerritory(terr.id); }} title={t('event.delete')}>
                <Trash2 size={12} />
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="layers-group">
        <div className="layers-group__header">
          {t('layers.assets')} ({assets.length})
        </div>
        {sortedAssets.length === 0 && <div className="layers-group__empty">{t('asset.empty')}</div>}
        {sortedAssets.map((asset, i) => {
          const def = ASSET_DEF_BY_KIND[asset.kind];
          return (
            <div
              key={asset.id}
              className={`layer-row${asset.id === selectedAssetId ? ' layer-row--active' : ''}`}
              onClick={() => selectAsset(asset.id === selectedAssetId ? null : asset.id)}
            >
              <span className="layer-row__icon">{def.icon ?? <TankGlyph size={13} />}</span>
              <span className="layer-row__name">{lang === 'ar' ? def.labelAr : def.labelEn}</span>
              <span className="layer-row__actions">
                <button type="button" onClick={(e) => { e.stopPropagation(); moveAsset(asset.id, 'up'); }} disabled={i === 0} title={t('territory.moveUp')}>
                  <ChevronUp size={12} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); moveAsset(asset.id, 'down'); }} disabled={i === sortedAssets.length - 1} title={t('territory.moveDown')}>
                  <ChevronDown size={12} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleAssetVisibility(asset.id); }} title={t('territory.toggleVisibility')}>
                  {asset.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleAssetLock(asset.id); }} title={t('territory.toggleLock')}>
                  {asset.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); duplicateAsset(asset.id); }} title={t('territory.duplicate')}>
                  <Copy size={12} />
                </button>
                <button type="button" className="layer-row__delete" onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }} title={t('event.delete')}>
                  <Trash2 size={12} />
                </button>
              </span>
            </div>
          );
        })}
      </div>

      <div className="layers-group">
        <div className="layers-group__header layers-group__header--row">
          <span>
            {t('layers.camera')} ({keyframes.length})
          </span>
          <button
            type="button"
            className="layers-group__add"
            title={t('camera.addKeyframe')}
            onClick={() =>
              addKeyframe({
                year: Math.round(currentYear),
                center: mapCenter,
                zoom: mapZoom,
                rotation: 0,
                tilt: 0,
              })
            }
          >
            <Plus size={13} />
          </button>
        </div>
        {sortedKeyframes.length === 0 && <div className="layers-group__empty">{t('camera.empty')}</div>}
        {sortedKeyframes.map((kf) => (
          <div
            key={kf.id}
            className={`layer-row${kf.id === selectedKeyframeId ? ' layer-row--active' : ''}`}
            onClick={() => {
              selectKeyframe(kf.id === selectedKeyframeId ? null : kf.id);
              seek(kf.year);
            }}
          >
            <span className="layer-row__icon">
              <CameraIcon size={12} />
            </span>
            <span className="layer-row__name">{formatYear(kf.year, t)}</span>
            <span className="layer-row__actions">
              <button
                type="button"
                className="layer-row__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeKeyframe(kf.id);
                }}
                title={t('event.delete')}
              >
                <Trash2 size={12} />
              </button>
            </span>
          </div>
        ))}
        {selectedKeyframe && (
          <div className="camera-keyframe-editor">
            <div className="field">
              <label className="field__label">{t('timeline.year')}</label>
              <input
                type="number"
                className="number-input"
                value={selectedKeyframe.year}
                onChange={(e) => updateKeyframe(selectedKeyframe.id, { year: Number(e.target.value) })}
              />
            </div>
            <div className="field__row">
              <div className="field">
                <label className="field__label">
                  {t('camera.rotation')}: {selectedKeyframe.rotation}°
                </label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={selectedKeyframe.rotation}
                  onChange={(e) => updateKeyframe(selectedKeyframe.id, { rotation: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label className="field__label">
                  {t('camera.tilt')}: {selectedKeyframe.tilt}°
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={selectedKeyframe.tilt}
                  onChange={(e) => updateKeyframe(selectedKeyframe.id, { tilt: Number(e.target.value) })}
                />
              </div>
            </div>
            <p className="territory-panel__hint">{t('camera.hint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
