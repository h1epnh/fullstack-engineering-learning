import type { Session } from '@ewallet-lab/session';
import {
  buildVietQrImageUrl,
  sanitizeVietQrText,
  topupService,
  vietQrService,
  VIETQR_ADDINFO_MAX,
  type LinkedBankAccount,
  type VietQrBank,
} from '@ewallet-lab/api-client';
import { Button, Card, Screen } from '@ewallet-lab/ui';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

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

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; url: string }
  | { kind: 'error'; message: string };

// Issue #44: URLs already loaded successfully this session (img.vietqr.io also sends
// `cache-control: public, max-age=86400`, so the browser serves repeats from its HTTP cache).
// Limit is 10 QR / 10 s / IP — verified live: beyond that the server answers HTTP 429 with a JSON
// body and NO Access-Control-Allow-Origin header, so a cross-origin fetch() cannot even read the
// status (it surfaces as a CORS failure). Hence a plain <img> preload + one generic error message.
const vietQrLoadedUrls = new Set<string>();
const RATE_LIMIT_MESSAGE =
  'Không tạo được mã VietQR. Có thể VietQR đang giới hạn lượt tạo mã (tối đa 10 mã / 10 giây / IP, trả HTTP 429) hoặc dịch vụ img.vietqr.io lỗi / không có mạng. Hãy đợi vài giây rồi bấm Thử lại.';

/** Exposed as `./ReceiveQr` (see vite.config.ts). */
export default function ReceiveQr({ session, onBack }: { session: Session; onBack: () => void }) {
  const [mode, setMode] = useState<'internal' | 'vietqr'>('internal');
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(
          [
            ['internal', 'QR nội bộ'],
            ['vietqr', 'QR ngân hàng (VietQR)'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            style={{
              flex: 1,
              padding: '10px 8px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 10,
              cursor: 'pointer',
              border: '1px solid var(--el-line)',
              background: mode === m ? 'var(--el-accent)' : 'var(--el-surface)',
              color: mode === m ? '#fff' : 'var(--el-ink)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'vietqr' && <VietQrPanel session={session} />}

      {mode === 'internal' && (
      <>
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
      </>
      )}
    </Screen>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  fontSize: 15,
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--el-line)',
  background: 'var(--el-surface)',
  color: 'var(--el-ink)',
};
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', display: 'block', marginBottom: 6 };

/**
 * Issue #44 — real NAPAS-standard (EMVCo) VietQR via img.vietqr.io, for one of the CURRENT user's
 * LinkedBankAccounts only. The "incoming money" side is a MOCK: linked accounts are simulated data,
 * so scanning this with a real bank app never credits the lab wallet (stated on screen below).
 */
function VietQrPanel({ session }: { session: Session }) {
  const [accounts, setAccounts] = useState<LinkedBankAccount[] | null>(null);
  const [banks, setBanks] = useState<VietQrBank[]>([]);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [accountId, setAccountId] = useState('');
  const [amountText, setAmountText] = useState('');
  const [content, setContent] = useState('');
  const [debounced, setDebounced] = useState({ amountText: '', content: '' });
  const [qr, setQr] = useState<FetchState>({ kind: 'idle' });
  const reqSeq = useRef(0);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([topupService.getLinkedAccounts(session.id), vietQrService.listBanks()])
      .then(([accs, bs]) => {
        if (cancelled) return;
        setAccounts(accs);
        setBanks(bs);
        if (accs[0]) setAccountId(accs[0].id);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Không tải được tài khoản liên kết hoặc danh sách ngân hàng VietQR. Vui lòng thử lại sau.');
      });
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  // Debounce typing so we don't burn the 10 QR / 10 s / IP quota on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced({ amountText, content }), 700);
    return () => clearTimeout(t);
  }, [amountText, content]);

  // Only accounts returned for the current session user are selectable (never someone else's).
  const account = accounts?.find((a) => a.id === accountId && a.userId === session.id);
  const bank = account ? banks.find((b) => b.code.toLowerCase() === account.bankCode.toLowerCase()) : undefined;
  const amount = Number(debounced.amountText.replace(/\D/g, '')) || 0;
  const url =
    account && bank
      ? buildVietQrImageUrl({
          bin: bank.bin,
          accountNumber: account.accountNumber,
          amount,
          addInfo: debounced.content,
          accountName: session.name,
        })
      : null;

  useEffect(() => {
    if (!url) {
      setQr({ kind: 'idle' });
      return;
    }
    if (vietQrLoadedUrls.has(url)) {
      setQr({ kind: 'ready', url });
      return;
    }
    const seq = ++reqSeq.current;
    setQr({ kind: 'loading' });
    const img = new Image();
    img.onload = () => {
      vietQrLoadedUrls.add(url);
      if (seq === reqSeq.current) setQr({ kind: 'ready', url });
    };
    img.onerror = () => {
      if (seq === reqSeq.current) setQr({ kind: 'error', message: RATE_LIMIT_MESSAGE });
    };
    img.src = url;
  }, [url, retryTick]);

  async function handleSave() {
    if (qr.kind !== 'ready' || !account) return;
    try {
      const blob = await (await fetch(qr.url)).blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vietqr-${account.bankCode}-${account.accountNumber}.svg`;
      a.click();
    } catch {
      window.open(qr.url, '_blank', 'noopener'); // CORS/limit failure: let the user save from the new tab
    }
  }

  if (loadError) return <p style={{ fontSize: 13, color: 'var(--el-danger, #c0392b)' }}>{loadError}</p>;
  if (!accounts) return <p style={{ fontSize: 12, color: 'var(--el-faint)' }}>Đang tải tài khoản liên kết…</p>;
  if (accounts.length === 0)
    return (
      <Card>
        <p style={{ fontSize: 13, margin: 0 }}>
          Bạn chưa liên kết tài khoản ngân hàng nào. Hãy liên kết một tài khoản trong mục Nạp/Rút tiền để tạo VietQR.
        </p>
      </Card>
    );

  const contentClean = sanitizeVietQrText(content);
  return (
    <>
      <Card>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="vq-account" style={labelStyle}>
            Tài khoản nhận tiền
          </label>
          <select id="vq-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.bankCode} · {a.accountNumber}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="vq-amount" style={labelStyle}>
            Số tiền (VND, tuỳ chọn)
          </label>
          <input
            id="vq-amount"
            inputMode="numeric"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Để trống = người quét tự nhập"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="vq-content" style={labelStyle}>
            Nội dung (tối đa {VIETQR_ADDINFO_MAX} ký tự, tự bỏ dấu/ký tự đặc biệt)
          </label>
          <input
            id="vq-content"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 120))}
            style={inputStyle}
          />
          {content && contentClean !== content && (
            <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginTop: 4 }}>Sẽ gửi: “{contentClean}”</div>
          )}
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0' }}>
        <div
          style={{
            width: 280,
            minHeight: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--el-line)',
          }}
        >
          {!bank && (
            <span style={{ fontSize: 12, color: 'var(--el-faint)', padding: 12, textAlign: 'center' }}>
              Mã ngân hàng “{account?.bankCode}” không có trong danh sách VietQR nên chưa tạo được QR.
            </span>
          )}
          {bank && qr.kind === 'loading' && <span style={{ fontSize: 12, color: 'var(--el-faint)' }}>Đang tạo VietQR…</span>}
          {bank && qr.kind === 'error' && (
            <span role="alert" style={{ fontSize: 12.5, color: 'var(--el-danger, #c0392b)', padding: 12, textAlign: 'center' }}>
              {qr.message}
              <br />
              <button onClick={() => setRetryTick((t) => t + 1)} style={{ marginTop: 8, cursor: 'pointer' }}>
                Thử lại
              </button>
            </span>
          )}
          {bank && qr.kind === 'ready' && (
            <img src={qr.url} alt="Mã VietQR nhận tiền" data-testid="vietqr-image" width={264} style={{ display: 'block' }} />
          )}
        </div>
        {bank && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12.5, color: 'var(--el-muted)' }}>
            <img src={bank.logo} alt="" height={20} />
            {bank.shortName} · {account?.accountNumber}
          </div>
        )}
      </div>

      <p
        data-testid="vietqr-mock-notice"
        style={{
          fontSize: 12,
          color: 'var(--el-muted)',
          background: 'var(--el-surface)',
          border: '1px dashed var(--el-line)',
          borderRadius: 10,
          padding: 10,
          margin: '0 0 12px',
        }}
      >
        <strong>Giả lập:</strong> mã VietQR này đúng chuẩn NAPAS nên app ngân hàng thật đọc được, nhưng tài khoản liên kết
        trong lab chỉ là dữ liệu giả lập. Tiền chuyển vào từ ngân hàng ngoài <strong>không</strong> tự cộng vào ví Ewallet
        Lab.
      </p>
      <Button variant="secondary" onClick={handleSave} disabled={qr.kind !== 'ready'}>
        Lưu ảnh
      </Button>
    </>
  );
}
