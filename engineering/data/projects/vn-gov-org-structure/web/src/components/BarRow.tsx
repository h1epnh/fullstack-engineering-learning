export function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="bar-row">
      <span>{label}</span>
      <span className="bar-track">
        <span className="bar-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="count">{count}</span>
    </div>
  );
}
