export type Glyph = 'circle' | 'diamond' | 'hexagon' | 'hexagon-outline' | 'triangle' | 'triangle-outline';

/** Small, generic entity-type glyphs (not real logos/emblems) — plotted along the power-map rings. */
export function GlyphIcon({
  glyph,
  color,
  size = 9,
  x,
  y,
}: {
  glyph: Glyph;
  color: string;
  size?: number;
  x: number;
  y: number;
}) {
  const s = size;
  switch (glyph) {
    case 'circle':
      return <circle cx={x} cy={y} r={s / 2} fill={color} />;
    case 'diamond':
      return (
        <rect
          x={x - s / 2}
          y={y - s / 2}
          width={s}
          height={s}
          fill={color}
          transform={`rotate(45 ${x} ${y})`}
        />
      );
    case 'hexagon':
    case 'hexagon-outline': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return `${x + (s / 1.6) * Math.cos(a)},${y + (s / 1.6) * Math.sin(a)}`;
      }).join(' ');
      return glyph === 'hexagon' ? (
        <polygon points={pts} fill={color} />
      ) : (
        <polygon points={pts} fill="none" stroke={color} strokeWidth={1.4} />
      );
    }
    case 'triangle':
    case 'triangle-outline': {
      const pts = [
        `${x},${y - s / 1.5}`,
        `${x + s / 1.7},${y + s / 2.2}`,
        `${x - s / 1.7},${y + s / 2.2}`,
      ].join(' ');
      return glyph === 'triangle' ? (
        <polygon points={pts} fill={color} />
      ) : (
        <polygon points={pts} fill="none" stroke={color} strokeWidth={1.4} />
      );
    }
  }
}
