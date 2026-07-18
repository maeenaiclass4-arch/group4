import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ASSET_DEFS, ASSET_DEF_BY_KIND } from '../../data/assets';
import { useAssetsStore } from '../../store/assetsStore';
import { TankGlyph } from './TankGlyph';
import './assets.css';

export function AssetLibraryPanel() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';

  const assets = useAssetsStore((s) => s.assets);
  const selectedAssetId = useAssetsStore((s) => s.selectedAssetId);
  const selectAsset = useAssetsStore((s) => s.selectAsset);
  const updateAsset = useAssetsStore((s) => s.updateAsset);
  const removeAsset = useAssetsStore((s) => s.removeAsset);
  const toggleVisibility = useAssetsStore((s) => s.toggleVisibility);
  const toggleLock = useAssetsStore((s) => s.toggleLock);
  const duplicateAsset = useAssetsStore((s) => s.duplicateAsset);
  const moveAsset = useAssetsStore((s) => s.moveAsset);

  const sorted = [...assets].sort((a, b) => b.order - a.order);
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div className="asset-panel">
      <div className="asset-panel__section">
        <p className="territory-panel__hint">{t('asset.dragHint')}</p>
        <div className="asset-grid">
          {ASSET_DEFS.map((def) => (
            <div
              key={def.kind}
              className="asset-tile"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-asset-kind', def.kind);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              title={lang === 'ar' ? def.labelAr : def.labelEn}
            >
              <span className="asset-tile__icon">{def.icon ?? <TankGlyph size={20} />}</span>
              <span className="asset-tile__label">{lang === 'ar' ? def.labelAr : def.labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedAsset && (
        <div className="asset-style-editor">
          <div className="asset-style-editor__title">
            {ASSET_DEF_BY_KIND[selectedAsset.kind].icon ?? <TankGlyph size={16} />}
            {lang === 'ar' ? ASSET_DEF_BY_KIND[selectedAsset.kind].labelAr : ASSET_DEF_BY_KIND[selectedAsset.kind].labelEn}
          </div>
          <div className="field__row">
            <div className="field">
              <label className="field__label">
                {t('asset.scale')}: {selectedAsset.scale.toFixed(1)}x
              </label>
              <input
                type="range"
                min={0.4}
                max={3}
                step={0.1}
                value={selectedAsset.scale}
                onChange={(e) => updateAsset(selectedAsset.id, { scale: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label className="field__label">
                {t('asset.rotation')}: {selectedAsset.rotation}°
              </label>
              <input
                type="range"
                min={0}
                max={359}
                step={5}
                value={selectedAsset.rotation}
                onChange={(e) => updateAsset(selectedAsset.id, { rotation: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="territory-list">
        {sorted.length === 0 && <div className="territory-list__empty">{t('asset.empty')}</div>}
        {sorted.map((asset, i) => {
          const def = ASSET_DEF_BY_KIND[asset.kind];
          return (
            <div
              key={asset.id}
              className={`territory-item${asset.id === selectedAssetId ? ' territory-item--active' : ''}`}
              onClick={() => selectAsset(asset.id === selectedAssetId ? null : asset.id)}
            >
              <span className="asset-item__icon">{def.icon ?? <TankGlyph size={14} />}</span>
              <span className="territory-item__name">{lang === 'ar' ? def.labelAr : def.labelEn}</span>
              <span className="territory-item__actions">
                <button type="button" onClick={(e) => { e.stopPropagation(); moveAsset(asset.id, 'up'); }} disabled={i === 0} title={t('territory.moveUp')}>
                  <ChevronUp size={13} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); moveAsset(asset.id, 'down'); }} disabled={i === sorted.length - 1} title={t('territory.moveDown')}>
                  <ChevronDown size={13} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleVisibility(asset.id); }} title={t('territory.toggleVisibility')}>
                  {asset.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleLock(asset.id); }} title={t('territory.toggleLock')}>
                  {asset.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); duplicateAsset(asset.id); }} title={t('territory.duplicate')}>
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="territory-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAsset(asset.id);
                  }}
                  title={t('event.delete')}
                >
                  <Trash2 size={13} />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
