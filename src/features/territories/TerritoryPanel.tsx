import { useTranslation } from 'react-i18next';
import { PenLine, Combine, Scissors, Layers, Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useTerritoriesStore } from '../../store/territoriesStore';
import { getShapeGeometry, getShapeName, findTerritory } from '../../lib/regions';
import { unionGeometries, differenceGeometries, intersectGeometries } from '../../lib/geometry';
import { ColorPicker } from '../../components/ui/ColorPicker';
import './territories.css';

export function TerritoryPanel() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';

  const mapTool = useUiStore((s) => s.mapTool);
  const setMapTool = useUiStore((s) => s.setMapTool);
  const selectedShapeIds = useUiStore((s) => s.selectedShapeIds);
  const clearShapeSelection = useUiStore((s) => s.clearShapeSelection);
  const toggleShapeSelection = useUiStore((s) => s.toggleShapeSelection);

  const territories = useTerritoriesStore((s) => s.territories);
  const selectedTerritoryId = useTerritoriesStore((s) => s.selectedTerritoryId);
  const selectTerritory = useTerritoriesStore((s) => s.selectTerritory);
  const addTerritory = useTerritoriesStore((s) => s.addTerritory);
  const updateTerritory = useTerritoriesStore((s) => s.updateTerritory);
  const removeTerritory = useTerritoriesStore((s) => s.removeTerritory);
  const toggleVisibility = useTerritoriesStore((s) => s.toggleVisibility);
  const toggleLock = useTerritoriesStore((s) => s.toggleLock);
  const duplicateTerritory = useTerritoriesStore((s) => s.duplicateTerritory);
  const moveTerritory = useTerritoriesStore((s) => s.moveTerritory);

  const sorted = [...territories].sort((a, b) => b.order - a.order);

  const consumeSourceTerritories = (ids: string[]) => {
    for (const id of ids) {
      if (findTerritory(id)) removeTerritory(id);
    }
  };

  const runBooleanOp = (op: 'union' | 'subtract' | 'intersect') => {
    const geometries = selectedShapeIds.map((id) => getShapeGeometry(id)).filter((g): g is NonNullable<typeof g> => Boolean(g));
    if (geometries.length < 2) return;

    let result = null;
    if (op === 'union') {
      result = unionGeometries(geometries);
    } else if (op === 'subtract') {
      result = differenceGeometries(geometries[0], geometries[1]);
    } else {
      result = intersectGeometries(geometries[0], geometries[1]);
    }
    if (!result) return;

    const names = selectedShapeIds.map((id) => getShapeName(id, lang));
    const opLabel = op === 'union' ? '+' : op === 'subtract' ? '−' : '∩';
    const id = addTerritory({
      name: names.join(` ${opLabel} `),
      geometry: result,
      fillColor: '#a67c27',
      strokeColor: '#8b6b3d',
      opacity: 0.35,
      strokeWidth: 1.5,
      visible: true,
      locked: false,
      sourceCountryIds: selectedShapeIds.filter((id) => !findTerritory(id)),
    });
    consumeSourceTerritories(selectedShapeIds);
    clearShapeSelection();
    selectTerritory(id);
  };

  return (
    <div className="territory-panel">
      <div className="territory-panel__toolbar">
        <button
          type="button"
          className={`btn btn--block${mapTool === 'draw' ? ' btn--primary' : ''}`}
          onClick={() => setMapTool(mapTool === 'draw' ? 'idle' : 'draw')}
        >
          <PenLine size={14} />
          {mapTool === 'draw' ? t('territory.cancelDraw') : t('territory.draw')}
        </button>
        <p className="territory-panel__hint">{t('territory.selectHint')}</p>
      </div>

      {selectedShapeIds.length > 0 && (
        <div className="territory-selection-bar">
          <div className="territory-selection-bar__header">
            <span>
              {selectedShapeIds.length} {t('territory.selected')}
            </span>
            <button type="button" className="territory-selection-bar__clear" onClick={clearShapeSelection}>
              <X size={13} />
            </button>
          </div>
          <div className="territory-selection-bar__chips">
            {selectedShapeIds.map((id) => (
              <span key={id} className="territory-chip" onClick={() => toggleShapeSelection(id)}>
                {getShapeName(id, lang)} <X size={10} />
              </span>
            ))}
          </div>
          <div className="territory-selection-bar__actions">
            <button type="button" className="btn" disabled={selectedShapeIds.length < 2} onClick={() => runBooleanOp('union')}>
              <Combine size={13} />
              {t('territory.merge')}
            </button>
            <button
              type="button"
              className="btn"
              disabled={selectedShapeIds.length !== 2}
              onClick={() => runBooleanOp('subtract')}
              title={t('territory.subtractHint')}
            >
              <Scissors size={13} />
              {t('territory.subtract')}
            </button>
            <button
              type="button"
              className="btn"
              disabled={selectedShapeIds.length !== 2}
              onClick={() => runBooleanOp('intersect')}
              title={t('territory.intersectHint')}
            >
              <Layers size={13} />
              {t('territory.intersect')}
            </button>
          </div>
        </div>
      )}

      <div className="territory-list">
        {sorted.length === 0 && <div className="territory-list__empty">{t('territory.empty')}</div>}
        {sorted.map((terr, i) => (
          <div key={terr.id} className="territory-item-group">
            <div
              className={`territory-item${terr.id === selectedTerritoryId ? ' territory-item--active' : ''}`}
              onClick={() => selectTerritory(terr.id === selectedTerritoryId ? null : terr.id)}
            >
              <span className="territory-item__swatch" style={{ background: terr.fillColor }} />
              <span className="territory-item__name">{terr.name}</span>
              <span className="territory-item__actions">
                <button type="button" onClick={(e) => { e.stopPropagation(); moveTerritory(terr.id, 'up'); }} disabled={i === 0} title={t('territory.moveUp')}>
                  <ChevronUp size={13} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); moveTerritory(terr.id, 'down'); }} disabled={i === sorted.length - 1} title={t('territory.moveDown')}>
                  <ChevronDown size={13} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleVisibility(terr.id); }} title={t('territory.toggleVisibility')}>
                  {terr.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); toggleLock(terr.id); }} title={t('territory.toggleLock')}>
                  {terr.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); duplicateTerritory(terr.id); }} title={t('territory.duplicate')}>
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="territory-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTerritory(terr.id);
                  }}
                  title={t('event.delete')}
                >
                  <Trash2 size={13} />
                </button>
              </span>
            </div>

            {terr.id === selectedTerritoryId && (
              <div className="territory-style-editor">
                <div className="field">
                  <label className="field__label">{t('territory.name')}</label>
                  <input
                    className="text-input"
                    value={terr.name}
                    onChange={(e) => updateTerritory(terr.id, { name: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="field__label">{t('territory.fillColor')}</label>
                  <ColorPicker value={terr.fillColor} onChange={(c) => updateTerritory(terr.id, { fillColor: c })} />
                </div>
                <div className="field">
                  <label className="field__label">{t('territory.strokeColor')}</label>
                  <ColorPicker value={terr.strokeColor} onChange={(c) => updateTerritory(terr.id, { strokeColor: c })} />
                </div>
                <div className="field__row">
                  <div className="field">
                    <label className="field__label">
                      {t('territory.opacity')}: {Math.round(terr.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.05}
                      max={0.9}
                      step={0.05}
                      value={terr.opacity}
                      onChange={(e) => updateTerritory(terr.id, { opacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label">
                      {t('territory.strokeWidth')}: {terr.strokeWidth}
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={4}
                      step={0.5}
                      value={terr.strokeWidth}
                      onChange={(e) => updateTerritory(terr.id, { strokeWidth: Number(e.target.value) })}
                    />
                  </div>
                </div>
                {terr.geometry.type === 'MultiPolygon' && <p className="territory-panel__hint">{t('territory.multiPolygonHint')}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
