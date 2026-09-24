export function StatTile({ num, label }: { num: string; label: string }) {
  return (
    <div className="stat-tile">
      <div className="num">{num}</div>
      <div className="label">{label}</div>
    </div>
  );
}
