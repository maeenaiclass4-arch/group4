import { useRef } from 'react';
import { project } from '../../lib/geo';
import { ASSET_DEF_BY_KIND } from '../../data/assets';
import { useAssetsStore } from '../../store/assetsStore';
import { useUiStore } from '../../store/uiStore';
import { TankGlyph } from './TankGlyph';

interface AssetLayerProps {
  svgToLonLat: (clientX: number, clientY: number) => [number, number] | null;
}

const BASE_SIZE = 22;

export function AssetLayer({ svgToLonLat }: AssetLayerProps) {
  const assets = useAssetsStore((s) => s.assets);
  const selectedAssetId = useAssetsStore((s) => s.selectedAssetId);
  const selectAsset = useAssetsStore((s) => s.selectAsset);
  const updateAsset = useAssetsStore((s) => s.updateAsset);
  const leftPanelTab = useUiStore((s) => s.leftPanelTab);
  const setLeftPanelTab = useUiStore((s) => s.setLeftPanelTab);
  const mapTool = useUiStore((s) => s.mapTool);

  const dragId = useRef<string | null>(null);

  const sorted = [...assets].sort((a, b) => a.order - b.order);

  const onPointerDown = (asset: (typeof assets)[number]) => (e: React.PointerEvent) => {
    if (mapTool !== 'idle' || asset.locked) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragId.current = asset.id;
    setLeftPanelTab('assets');
    selectAsset(asset.id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragId.current) return;
    const lonlat = svgToLonLat(e.clientX, e.clientY);
    if (lonlat) updateAsset(dragId.current, { position: lonlat });
  };

  const onPointerUp = () => {
    dragId.current = null;
  };

  return (
    <g className="asset-layer">
      {sorted.map((asset) => {
        if (!asset.visible) return null;
        const def = ASSET_DEF_BY_KIND[asset.kind];
        const [x, y] = project(asset.position);
        const isSelected = asset.id === selectedAssetId && leftPanelTab === 'assets';
        const size = BASE_SIZE * asset.scale;

        return (
          <g
            key={asset.id}
            transform={`translate(${x},${y}) rotate(${asset.rotation})`}
            style={{ cursor: asset.locked ? 'default' : 'grab' }}
            onPointerDown={onPointerDown(asset)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {isSelected && <circle r={size * 0.75} fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 2" />}
            {def.icon ? (
              <text textAnchor="middle" dominantBaseline="central" fontSize={size} style={{ userSelect: 'none' }}>
                {def.icon}
              </text>
            ) : (
              <g transform={`translate(${-size / 2},${-size / 2})`}>
                <TankGlyph size={size} color="var(--text-primary)" />
              </g>
            )}
            <title>{def.labelAr}</title>
          </g>
        );
      })}
    </g>
  );
}
