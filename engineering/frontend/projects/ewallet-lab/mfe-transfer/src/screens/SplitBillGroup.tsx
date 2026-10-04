import { type SplitGroup, paymentRequestService } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StatusPill, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #11 — "Danh sách đã thu": reuses the tab-list Card pattern from PaymentReminderHome.tsx's
 * `ReminderList`, but this is a single group's shares rather than a flat list across groups (a
 * split-bill group is a temporary, self-contained unit — see backend DESIGN.md for why it's not
 * modeled as an ongoing membership the way issue #14's "quỹ nhóm" would be).
 *
 * <p>No push notification (same adapted-not-hidden gap as payment-reminder) — refresh is manual
 * (button) or on mount, not live.
 */
export function SplitBillGroup({ groupId, onBack }: { groupId: string; onBack: () => void }) {
  const [group, setGroup] = useState<SplitGroup | null | 'not-found'>(null);

  function reload() {
    paymentRequestService
      .getSplitGroup(groupId)
      .then(setGroup)
      .catch(() => setGroup('not-found'));
  }

  useEffect(reload, [groupId]);

  if (group === null) {
    return (
      <Screen withNavGutter={false}>
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>
      </Screen>
    );
  }

  if (group === 'not-found') {
    return (
      <Screen withNavGutter={false}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 10px' }}>
          <Icon name="link_off" size={40} style={{ color: 'var(--el-danger)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Không tìm thấy nhóm chia tiền này</p>
          <Button variant="ghost" onClick={onBack} style={{ maxWidth: 200 }}>
            Về trang chủ
          </Button>
        </div>
      </Screen>
    );
  }

  const progressPct = group.groupTotal > 0 ? Math.round((group.totalCollected / group.groupTotal) * 100) : 0;

  return (
    <Screen title="Danh sách đã thu" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Về trang chủ
      </button>

      <Card>
        <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>{group.groupLabel}</p>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--el-surface-2)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--el-accent)',
              borderRadius: 999,
              transition: 'width .2s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>
            Đã thu <strong style={{ color: 'var(--el-ink)' }}>{formatVnd(group.totalCollected)}</strong>
          </span>
          <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>
            Còn thiếu <strong style={{ color: 'var(--el-ink)' }}>{formatVnd(group.totalRemaining)}</strong>
          </span>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
        {group.shares.map((share, i) => (
          <Card key={share.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Người {i + 1}</p>
                <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '2px 0 0' }}>{formatVnd(share.amount)}</p>
              </div>
              <StatusPill status={share.status} />
            </div>
          </Card>
        ))}
      </div>

      <Button variant="secondary" onClick={reload}>
        Làm mới
      </Button>
    </Screen>
  );
}
