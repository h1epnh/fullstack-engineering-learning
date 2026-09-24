import { type VietQrBank, vietQrService } from '@ewallet-lab/api-client';
import { Button, Icon, Screen, TextField } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';
import { QrScanner } from './QrScanner';

/** `wired: true` items are real (payment-request-service for #3/#8, lucky-money-service for #10)
 * — App.tsx's onComingSoon wrapper intercepts their key before it ever reaches the shell's
 * ComingSoon screen. Everything else here is still genuinely comingSoon. */
const OTHER_SERVICES: { key: string; icon: string; label: string; wired?: boolean }[] = [
  { key: 'send-card', icon: 'card_giftcard', label: 'Gửi thiệp' },
  { key: 'split-bill', icon: 'call_split', label: 'Chia tiền' },
  { key: 'payment-reminder', icon: 'notifications_active', label: 'Nhắc trả tiền', wired: true },
  { key: 'fund', icon: 'groups', label: 'Quỹ' },
  { key: 'lucky-money', icon: 'redeem', label: 'Giật lì xì', wired: true },
  { key: 'payment-link', icon: 'link', label: 'Link nhận tiền', wired: true },
];

const PHONE_RE = /^0\d{9}$/;

/**
 * Parses this lab's own invented QR payload format (`ewalletlab://pay?phone=<phone>` — see
 * `mfe-wallet/src/screens/ReceiveQr.tsx`'s `qrPayloadFor` and frontend DESIGN.md). Returns null for
 * anything else (including real VietQR/bank QR codes) — decoding those is explicitly out of scope
 * for this ticket, see issue #4 Constraints.
 */
function parseEwalletLabQrPhone(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'ewalletlab:' || url.host !== 'pay') return null;
    const phone = url.searchParams.get('phone');
    return phone && PHONE_RE.test(phone) ? phone : null;
  } catch {
    return null;
  }
}

/**
 * Structure mirrors the real MoMo "Chuyển tiền" screen (from screenshot): search bar, 2
 * destination-type cards, a bank shortcut row, and a grid of secondary services. Only "Người
 * dùng khác" (transfer to another Ewallet Lab user, real — transfer-service) is wired; the bank
 * row opens BankTransferForm (full MoMo-style UI, incl. validation) but its "Tiếp tục" still
 * routes to comingSoon — no real interbank rail exists in this lab. Most items in "Dịch vụ khác"
 * are still comingSoon; `payment-link` (#3) and `payment-reminder` (#8) are now real — see
 * OTHER_SERVICES's `wired` flag and App.tsx's onComingSoon wrapper. Bank logos come live from VietQR's public bank-directory API
 * (api.vietqr.io/v2/banks, see vietQrService.ts) — a real, public NAPAS-backed directory meant
 * for exactly this (identifying a bank in a transfer/QR flow), not a bundled trademark asset.
 */
export function TransferHome({
  onSearch,
  onSelectBank,
  onComingSoon,
}: {
  onSearch: (phone: string) => Promise<string | null>;
  onSelectBank: (bank: VietQrBank) => void;
  onComingSoon: (feature: string) => void;
}) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<VietQrBank[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    vietQrService.listBanks().then(setBanks);
  }, []);

  const localError = phone.length > 0 && !PHONE_RE.test(phone) ? 'Số điện thoại chưa hợp lệ.' : undefined;

  async function search(searchPhone: string) {
    setLoading(true);
    const err = await onSearch(searchPhone);
    setLoading(false);
    if (err) setError(err);
  }

  async function handleScanned(rawValue: string) {
    setScanning(false);
    const scannedPhone = parseEwalletLabQrPhone(rawValue);
    if (!scannedPhone) {
      setError('Mã QR không đúng định dạng của Ewallet Lab. Vui lòng nhập số điện thoại thủ công.');
      return;
    }
    setPhone(scannedPhone);
    setError(undefined);
    await search(scannedPhone);
  }

  return (
    <Screen title="Chuyển tiền" withNavGutter={false}>
      <TextField
        id="toPhone"
        label="Số điện thoại người nhận"
        placeholder="09xxxxxxxx"
        inputMode="numeric"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value.trim());
          setError(undefined);
        }}
        error={error ?? localError}
      />
      <Button
        onClick={() => search(phone)}
        disabled={loading || phone.length === 0 || !!localError}
        style={{ marginBottom: 10 }}
      >
        {loading ? 'Đang tìm…' : 'Tìm người nhận'}
      </Button>
      <button
        onClick={() => setScanning(true)}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          background: 'none',
          border: 0,
          padding: '4px 0',
          marginBottom: 24,
          color: 'var(--el-accent-ink)',
          fontSize: 13,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        <Icon name="qr_code_scanner" size={18} />
        Quét mã QR
      </button>
      {scanning && <QrScanner onDetected={handleScanned} onClose={() => setScanning(false)} />}

      <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>Chuyển tiền đến</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <DestinationCard
          icon="account_balance_wallet"
          label="Người dùng khác"
          active
          onClick={() => document.getElementById('toPhone')?.focus()}
        />
        <DestinationCard icon="account_balance" label="Ngân hàng" onClick={() => onComingSoon('bank-p2p-transfer')} />
      </div>

      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '0 0 8px' }}>
        Ngân hàng liên kết
      </p>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {banks.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--el-faint)', padding: '10px 0' }}>Đang tải ngân hàng…</span>
        )}
        {banks.map((b) => (
          <button
            key={b.code}
            onClick={() => onSelectBank(b)}
            style={{
              flex: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 0,
              cursor: 'pointer',
              width: 68,
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                border: '1px solid var(--el-line)',
                overflow: 'hidden',
              }}
            >
              <img
                src={b.logo}
                alt={b.shortName}
                style={{ width: 30, height: 30, objectFit: 'contain', transform: 'scale(1.5)' }}
              />
            </span>
            <span style={{ fontSize: 10.5, color: 'var(--el-muted)', textAlign: 'center' }}>{b.shortName}</span>
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>Dịch vụ khác</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 4px' }}>
        {OTHER_SERVICES.map((s) => (
          <button
            key={s.key}
            onClick={() => onComingSoon(s.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 7,
              background: 'none',
              border: 0,
              cursor: 'pointer',
              opacity: s.wired ? 1 : 0.55,
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'var(--el-surface)',
                border: '1px solid var(--el-line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={s.icon} size={20} style={{ color: 'var(--el-accent-ink)' }} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--el-ink)' }}>{s.label}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

function DestinationCard({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 12px',
        borderRadius: 12,
        border: `1.5px solid ${active ? 'var(--el-accent)' : 'var(--el-line)'}`,
        background: active ? 'var(--el-accent-soft)' : 'var(--el-surface)',
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={22} style={{ color: active ? 'var(--el-accent-ink)' : 'var(--el-muted)' }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--el-accent-ink)' : 'var(--el-ink)' }}>
        {label}
      </span>
    </button>
  );
}
