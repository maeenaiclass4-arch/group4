interface TankGlyphProps {
  size?: number;
  color?: string;
}

/** Unicode has no tank emoji, so we draw a simple silhouette instead. */
export function TankGlyph({ size = 18, color = 'currentColor' }: TankGlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="16" width="20" height="2" rx="1" fill={color} />
      <circle cx="5" cy="17" r="1.6" fill={color} />
      <circle cx="9" cy="17" r="1.6" fill={color} />
      <circle cx="13" cy="17" r="1.6" fill={color} />
      <circle cx="17" cy="17" r="1.6" fill={color} />
      <rect x="4" y="10" width="16" height="6" rx="1.5" fill={color} />
      <rect x="8" y="6" width="7" height="5" rx="1" fill={color} />
      <rect x="13" y="7.2" width="8" height="1.6" rx="0.8" fill={color} />
    </svg>
  );
}
