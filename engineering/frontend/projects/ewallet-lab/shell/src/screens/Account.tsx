import type { Session } from '@ewallet-lab/session';
import { Button, Card, Screen } from '@ewallet-lab/ui';

/**
 * Kept in the shell rather than as its own remote: it's a thin view over
 * session state the shell already owns, with no backend calls of its own —
 * splitting it into a 5th micro-app would be scaffolding for its own sake.
 */
export function Account({ session, onLogout }: { session: Session; onLogout: () => void }) {
  return (
    <Screen title="Cá nhân">
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--el-faint)', fontWeight: 600 }}>HỌ VÀ TÊN</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{session.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--el-faint)', fontWeight: 600 }}>SỐ ĐIỆN THOẠI</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{session.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--el-faint)', fontWeight: 600 }}>USER ID</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--el-font-mono)', color: 'var(--el-muted)' }}>
              {session.id}
            </div>
          </div>
        </div>
      </Card>
      <div style={{ marginTop: 20 }}>
        <Button variant="ghost" onClick={onLogout}>
          Đăng xuất
        </Button>
      </div>
    </Screen>
  );
}
