import { useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import './ui.css';

export interface ComboBoxOption {
  value: string;
  label: string;
  meta?: string;
}

interface ComboBoxProps {
  options: ComboBoxOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export function ComboBox({ options, value, onChange, placeholder, allowClear }: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 200);
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 200);
  }, [options, query]);

  return (
    <div className="combobox" ref={ref}>
      <button type="button" className="combobox__trigger" onClick={() => setOpen((o) => !o)}>
        <span className={selected ? '' : 'combobox__placeholder'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="combobox__panel">
          <div className="combobox__search">
            <Search size={13} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="combobox__search-input"
            />
          </div>
          <div className="combobox__list">
            {allowClear && (
              <button
                type="button"
                className="combobox__option combobox__option--muted"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                  setQuery('');
                }}
              >
                —
              </button>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`combobox__option${opt.value === value ? ' combobox__option--active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
              >
                {opt.label}
                {opt.meta && <span className="combobox__meta">{opt.meta}</span>}
              </button>
            ))}
            {filtered.length === 0 && <div className="combobox__empty">—</div>}
          </div>
        </div>
      )}
    </div>
  );
}
