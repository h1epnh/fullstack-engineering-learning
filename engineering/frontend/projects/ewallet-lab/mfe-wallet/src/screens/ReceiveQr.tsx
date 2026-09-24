import type { Session } from '@ewallet-lab/session';
import { Button, Card, Screen } from '@ewallet-lab/ui';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

/**
 * Own-QR "Nhận tiền" screen (issue #4). Payload format is invented for this lab, NOT a real
 * standard — see frontend DESIGN.md "QR payload format" for the documented shape:
 * `ewalletlab://pay?phone=<phone>`. Deliberately minimal (avatar/name/QR + Chia sẻ/Lưu ảnh only,
 * no fixed-amount input) — matches the real MoMo personal-QR screen layout confirmed by
 * agent-designer's research on this issue (momo.vn/hoi-dap/cach-gui-ma-qr-ca-nhan-de-nguoi-khac-chuyen-tien-cho-minh):
 * the amount is entered by whoever scans, not baked into the QR by its owner.
 */
export function qrPayloadFor(phone: string): string {
  return `ewalletlab://pay?phone=${encodeURIComponent(phone)}`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.[0] ?? '?').toUpperCase();
}

/** Exposed as `./ReceiveQr` (see vite.config.ts). */
export default function ReceiveQr({ session, onBack }: { session: Session; onBack: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrPayloadFor(session.phone), { width: 240, margin: 1 }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [session.phone]);

  async function handleShare() {
    setShareMsg(undefined);
    const text = `Chuyển tiền cho ${session.name} qua Ewallet Lab — SĐT ${session.phone}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mã QR nhận tiền', text });
      } catch {
        // user cancelled the native share sheet — not an error
      }
      return;
    }
    // Fallback for browsers without the Web Share API (e.g. desktop Chrome without a share target).
    try {
      await navigator.clipboard.writeText(text);
      setShareMsg('Đã sao chép thông tin nhận tiền vào clipboard.');
    } catch {
      setShareMsg('Trình duyệt này không hỗ trợ chia sẻ trực tiếp.');
    }
  }

  function handleSave() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ewallet-lab-qr-${session.phone}.png`;
    a.click();
  }

  return (
    <Screen title="Nhận tiền" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--el-accent)',
              color: '#fff0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--el-font-display)',
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            {initialsOf(session.name)}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{session.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>{session.phone}</div>
          </div>

          <div
            style={{
              width: 240,
              height: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--el-line)',
            }}
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`Mã QR nhận tiền của ${session.name}`} width={224} height={224} />
            ) : (
              <span style={{ fontSize: 12, color: 'var(--el-faint)' }}>Đang tạo mã QR…</span>
            )}
          </div>

          <p style={{ fontSize: 12, color: 'var(--el-faint)', textAlign: 'center', margin: 0 }}>
            Đưa mã này cho người muốn chuyển tiền cho bạn quét bằng tính năng "Quét mọi QR" hoặc ngay trong màn hình
            Chuyển tiền.
          </p>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={handleShare}>
          Chia sẻ
        </Button>
        <Button variant="secondary" onClick={handleSave} disabled={!qrDataUrl}>
          Lưu ảnh
        </Button>
      </div>
      {shareMsg && <p style={{ fontSize: 12, color: 'var(--el-muted)', marginTop: 10, textAlign: 'center' }}>{shareMsg}</p>}
    </Screen>
  );
}
