import { Icon } from './Icon';

export type NavItem = {
  key: string;
  label: string;
  icon: string;
  /** Renders as a raised circular action button instead of a normal tab — matches the real
   * MoMo app's center "Quét mọi QR" button (analyzed from screenshots). Fires `onSpecialClick`
   * instead of `onChange`, since it's an action (opens a scanner), not a persistent tab. */
  special?: boolean;
};

/**
 * 5 items, matching the real MoMo app's own bottom nav (verified from screenshots) — not the
 * "max 3 modules" rule found on developers.momo.vn, which turned out to be guidance for
 * third-party mini-apps embedded inside MoMo, not a constraint MoMo applies to its own app shell.
 * https://developers.momo.vn/v3/docs/app-center/design-guideline/general-ux-principles/
 */
export function BottomNav({
  items,
  active,
  onChange,
  onSpecialClick,
}: {
  items: NavItem[];
  active: string;
  onChange: (key: string) => void;
  onSpecialClick?: (key: string) => void;
}) {
  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        background: 'var(--el-surface)',
        borderTop: '1px solid var(--el-line)',
        paddingBottom: 'var(--el-safe-bottom)',
      }}
    >
      {items.map((item) => {
        if (item.special) {
          return (
            <button
              key={item.key}
              onClick={() => onSpecialClick?.(item.key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'transparent',
                border: 0,
                padding: '0 0 8px',
                cursor: 'pointer',
                color: 'var(--el-accent-ink)',
              }}
            >
              <span
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--el-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -22,
                  boxShadow: '0 4px 12px -2px color-mix(in srgb, var(--el-accent) 55%, transparent)',
                  border: '4px solid var(--el-surface)',
                }}
              >
                <Icon name={item.icon} size={24} style={{ color: '#fff0f6' }} />
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700 }}>{item.label}</span>
            </button>
          );
        }
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 0,
              padding: '10px 0 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: isActive ? 'var(--el-accent-ink)' : 'var(--el-faint)',
              cursor: 'pointer',
            }}
          >
            <Icon name={item.icon} size={22} />
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
