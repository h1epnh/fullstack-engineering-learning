import type { CSSProperties } from 'react';

/**
 * Renders a Google Material Symbols glyph by name (e.g. "home", "receipt_long") — see
 * https://fonts.google.com/icons for the full name list. The font itself is loaded once via
 * `@import` in tokens.css so every app (shell + each standalone remote dev harness) gets it for
 * free just by importing `@ewallet-lab/ui`. Replaces the emoji icons used earlier in this app.
 */
export function Icon({ name, size = 22, style }: { name: string; size?: number; style?: CSSProperties }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
