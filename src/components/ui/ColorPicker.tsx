import './ui.css';

const PRESET_COLORS = [
  '#8c1f28', '#7a2e33', '#a6532f', '#a67c27', '#4a6741', '#1f5c46',
  '#2f6b63', '#3f5566', '#2e3a59', '#5b3358', '#5a4a3a', '#3b2a1e',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="color-picker">
      <div className="color-picker__swatches">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`color-picker__swatch${value.toLowerCase() === c ? ' color-picker__swatch--active' : ''}`}
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={c}
          />
        ))}
        <label className="color-picker__custom" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
