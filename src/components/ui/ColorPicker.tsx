import './ui.css';

const PRESET_COLORS = [
  '#e5484d', '#f43f5e', '#f5a524', '#eab308', '#4ade80', '#22c55e',
  '#2dd4bf', '#38bdf8', '#0ea5e9', '#6d8bff', '#a78bfa', '#c084fc',
  '#f472b6', '#94a3b8', '#6b7280',
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
