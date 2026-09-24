import { Icon } from './Icon';

export function QuickAction({
  icon,
  label,
  onClick,
  comingSoon,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  comingSoon?: boolean;
}) {
  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      aria-disabled={comingSoon}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        background: 'transparent',
        border: 0,
        cursor: comingSoon ? 'default' : 'pointer',
        opacity: comingSoon ? 0.45 : 1,
        flex: '1 0 22%',
        minWidth: 68,
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'var(--el-surface)',
          border: '1px solid var(--el-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--el-shadow)',
        }}
      >
        <Icon name={icon} size={22} style={{ color: 'var(--el-accent-ink)' }} />
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--el-ink)', textAlign: 'center' }}>
        {label}
      </span>
      {comingSoon && (
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--el-amber)' }}>SẮP RA MẮT</span>
      )}
    </button>
  );
}
