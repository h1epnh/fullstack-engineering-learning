import { walletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Card, EmptyState, Icon, ProgressBar, Screen } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';
import { type NotificationItem, buildNotifications, loadReadIds, markRead } from '../notifications';

/** Exposed as `./Notifications` (see vite.config.ts). Reached from Home's bell icon. */
export default function Notifications({ session }: { session: Session }) {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    walletService.getTransactions(session.id).then((txs) => {
      setItems(buildNotifications(txs));
      setReadIds(loadReadIds(session.id));
    });
  }, [session.id]);

  function handleOpen(id: string) {
    markRead(session.id, id);
    setReadIds((prev) => new Set(prev).add(id));
  }

  return (
    <Screen title="Thông báo" withNavGutter={false}>
      {items === null ? (
        <ProgressBar label="Đang tải…" />
      ) : items.length === 0 ? (
        <EmptyState icon="notifications_none" text="Chưa có thông báo nào." />
      ) : (
        <Card>
          {items.map((item, i) => {
            const unread = !readIds.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleOpen(item.id)}
                style={{
                  display: 'flex',
                  gap: 12,
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 0,
                  borderBottom: i < items.length - 1 ? '1px solid var(--el-line)' : 0,
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--el-accent-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon name={item.icon} size={18} style={{ color: 'var(--el-accent-ink)' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: unread ? 700 : 500 }}>{item.title}</span>
                    {unread && (
                      <span
                        style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--el-accent)', flex: 'none' }}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--el-muted)', margin: '2px 0' }}>{item.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--el-faint)' }}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </button>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
