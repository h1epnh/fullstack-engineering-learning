export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Open arc (for stroke rings / curved textPath labels) — not a filled wedge. */
export function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Filled annulus sector (ring segment) between two radii and two angles. */
export function wedgePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const oStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const oEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const iEnd = polarToCartesian(cx, cy, rInner, endAngle);
  const iStart = polarToCartesian(cx, cy, rInner, startAngle);
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    'Z',
  ].join(' ');
}

/** Evenly spaced angles for `count` icons inside [startAngle, endAngle], with inset margins so
 * icons don't collide with the wedge's straight edges. */
export function iconAngles(startAngle: number, endAngle: number, count: number): number[] {
  if (count <= 0) return [];
  const span = endAngle - startAngle;
  const inset = Math.min(span * 0.12, 6);
  const usable = span - inset * 2;
  if (count === 1) return [startAngle + span / 2];
  return Array.from({ length: count }, (_, i) => startAngle + inset + (usable * i) / (count - 1));
}
