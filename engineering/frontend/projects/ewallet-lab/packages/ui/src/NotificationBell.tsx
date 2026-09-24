import { Icon } from './Icon';

export function NotificationBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={count > 0 ? `Thông báo, ${count} chưa đọc` : 'Thông báo'}
      style={{
        position: 'relative',
        background: 'var(--el-surface)',
        border: '1px solid var(--el-line)',
        borderRadius: '50%',
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--el-shadow)',
        flex: 'none',
      }}
    >
      <Icon name="notifications" size={19} style={{ color: 'var(--el-ink)' }} />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            background: 'var(--el-danger)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
