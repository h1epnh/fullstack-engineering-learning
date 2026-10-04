import type { SplitGroup } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

/** Issue #11 — right after creating a split, show each share's shareable link (same
 * `.../pay/<id>` shape as a normal payment-link, see PaymentLinkCreated.tsx — a split share IS a
 * LINK under the hood, see backend PaymentRequest.groupId's javadoc). */
export function SplitBillCreated({
  group,
  shellOrigin,
  onViewCollected,
  onDone,
}: {
  group: SplitGroup;
  shellOrigin: string;
  onViewCollected: () => void;
  onDone: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copy(shareId: string) {
    const url = `${shellOrigin}/pay/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(shareId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API unavailable/blocked — URL still visible below, best-effort only.
    }
  }

  return (
    <Screen title="Đã tạo mã chia tiền" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <Icon name="groups" size={32} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{group.groupLabel}</p>
          <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--el-font-display)', margin: 0 }}>
            {formatVnd(group.groupTotal)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: 0 }}>Chia cho {group.shares.length} người</p>
        </div>
      </Card>

      <p style={{ fontSize: 12.5, fontWeight: 700, margin: '20px 0 10px' }}>Gửi link cho từng người</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {group.shares.map((share, i) => (
          <Card key={share.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>Người {i + 1}</p>
                <p style={{ fontSize: 14, fontWeight: 800, margin: '2px 0 0' }}>{formatVnd(share.amount)}</p>
              </div>
              <Button variant="secondary" onClick={() => copy(share.id)} style={{ width: 'auto', padding: '8px 14px' }}>
                {copiedId === share.id ? 'Đã sao chép!' : 'Sao chép link'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button onClick={onViewCollected}>Xem danh sách đã thu</Button>
        <Button variant="ghost" onClick={onDone}>
          Xong
        </Button>
      </div>
    </Screen>
  );
}
