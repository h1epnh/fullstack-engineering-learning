import type { PaymentRequest } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

/** Shows the just-created link's shareable URL (`.../pay/<token>`, see shell/src/App.tsx's minimal
 * deep-link mechanism) — issue #3's Task step 3. */
export function PaymentLinkCreated({ link, shellOrigin, onDone }: { link: PaymentRequest; shellOrigin: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `${shellOrigin}/pay/${link.id}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable/blocked — the URL is still selectable text below, best-effort only.
    }
  }

  return (
    <Screen title="Link đã sẵn sàng" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <Icon name="link" size={36} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Yêu cầu nhận {formatVnd(link.amount)}</p>
          {link.message && <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>{link.message}</p>}
          <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: 0 }}>
            Hết hạn: {link.expiresAt ? new Date(link.expiresAt).toLocaleString('vi-VN') : '—'}
          </p>
        </div>
      </Card>

      <div
        style={{
          marginTop: 16,
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          border: '1px dashed var(--el-line)',
          fontSize: 12.5,
          wordBreak: 'break-all',
          color: 'var(--el-ink)',
        }}
      >
        {url}
      </div>

      <Button variant="secondary" onClick={copy} style={{ marginBottom: 10 }}>
        {copied ? 'Đã sao chép!' : 'Sao chép link'}
      </Button>
      <Button onClick={onDone}>Xong</Button>
    </Screen>
  );
}
