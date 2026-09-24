import type { LinkedBankAccount } from '@ewallet-lab/api-client';
import { Button, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

const TOPUP_MIN = 10000; // matches @DecimalMin("10000") on TopupRequestDto — see MoMo spec references
const TOPUP_PRESETS = [50000, 100000, 200000, 500000];

type Mode = 'topup' | 'withdraw';

/**
 * Structure mirrors the real MoMo "Nạp/Rút" screen (analyzed from screenshots): tab switcher,
 * a row of wallet source/destination cards (only "Ví chính" is real here — Ví Trả Sau/Túi Thần
 * Tài are the same coming-soon wallets shown on Home), an amount field with inline validation,
 * and — for nạp only — a payment-method selector. Rút tiền has no method selector in the real
 * screenshots either, just the amount field.
 */
export function NapRut({
  mode,
  onModeChange,
  balance,
  account,
  onSubmitTopup,
  onSubmitWithdraw,
  onComingSoon,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  balance: number;
  account: LinkedBankAccount;
  onSubmitTopup: (amount: number) => Promise<string | null>;
  onSubmitWithdraw: (amount: number) => Promise<string | null>;
  onComingSoon: (feature: string) => void;
}) {
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<'linked' | 'transfer'>('linked');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const invalid =
    amount !== '' && (mode === 'topup' ? amount < TOPUP_MIN : amount <= 0 || amount > balance);

  const inlineError =
    error ??
    (amount !== '' && invalid
      ? mode === 'topup'
        ? `Tối thiểu ${formatVnd(TOPUP_MIN)}`
        : 'Số tiền rút lớn hơn số dư trong Ví.'
      : undefined);

  function switchMode(next: Mode) {
    setAmount('');
    setError(undefined);
    onModeChange(next);
  }

  async function submit() {
    if (amount === '' || invalid) return;
    setLoading(true);
    const err = mode === 'topup' ? await onSubmitTopup(amount) : await onSubmitWithdraw(amount);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <h1 style={{ fontFamily: 'var(--el-font-display)', fontSize: 19, fontWeight: 800, margin: '0 0 16px' }}>
        Nạp/Rút
      </h1>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'var(--el-surface-2)', borderRadius: 12, padding: 3 }}>
        {(['topup', 'withdraw'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 0',
              borderRadius: 9,
              border: 0,
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 700,
              background: mode === m ? 'var(--el-surface)' : 'transparent',
              color: mode === m ? 'var(--el-accent-ink)' : 'var(--el-faint)',
              boxShadow: mode === m ? 'var(--el-shadow)' : 'none',
            }}
          >
            <Icon name={m === 'topup' ? 'call_received' : 'call_made'} size={17} />
            {m === 'topup' ? 'Nạp tiền' : 'Rút tiền'}
          </button>
        ))}
      </div>

      {/* Wallet source/destination row — only "Ví chính" is real */}
      <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 8px' }}>
        {mode === 'topup' ? 'Nạp tiền vào' : 'Rút tiền từ'}
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        <WalletCard label="Ví chính" value={formatVnd(balance)} active />
        <WalletCard label="Ví Trả Sau" value="Chưa mở" onClick={() => onComingSoon('finance-insurance')} />
        <WalletCard label="Túi Thần Tài" value="Chưa mở" onClick={() => onComingSoon('suggested')} />
      </div>

      {/* Amount */}
      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '0 0 6px' }}>
        {mode === 'topup' ? 'Số tiền cần nạp' : 'Số tiền cần rút'}
      </p>
      <input
        inputMode="numeric"
        value={amount === '' ? '' : amount.toLocaleString('vi-VN')}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setAmount(v === '' ? '' : Number(v));
          setError(undefined);
        }}
        placeholder="0đ"
        style={{
          width: '100%',
          fontSize: 26,
          fontWeight: 700,
          fontFamily: 'var(--el-font-display)',
          padding: '16px 16px',
          borderRadius: 12,
          border: `1.5px solid ${inlineError ? 'var(--el-danger)' : 'var(--el-line)'}`,
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          marginBottom: 6,
        }}
      />
      {inlineError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{inlineError}</span>
        </div>
      )}
      {!inlineError && <div style={{ marginBottom: 14 }} />}

      {mode === 'topup' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {TOPUP_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setAmount(p);
                setError(undefined);
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: '1px solid var(--el-line)',
                background: amount === p ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                color: amount === p ? 'var(--el-accent-ink)' : 'var(--el-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {(p / 1000).toLocaleString('vi-VN')}k
            </button>
          ))}
        </div>
      )}

      {/* Method selector — nạp only, matches real screenshot */}
      {mode === 'topup' && (
        <>
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>Chọn cách nạp tiền</p>
          <MethodOption
            selected={method === 'linked'}
            title="Nạp từ ngân hàng liên kết"
            subtitle={`${account.bankCode} · ${account.accountNumber}`}
            onClick={() => setMethod('linked')}
          />
          <MethodOption
            selected={method === 'transfer'}
            title="Chuyển khoản từ ngân hàng"
            subtitle="Chuyển vào ví từ ngân hàng bất kỳ"
            onClick={() => onComingSoon('bank-transfer')}
          />
        </>
      )}

      <div style={{ marginTop: mode === 'topup' ? 20 : 4 }}>
        <Button onClick={submit} disabled={loading || amount === '' || invalid}>
          {loading ? 'Đang xử lý…' : mode === 'topup' ? 'Nạp tiền' : 'Rút tiền'}
        </Button>
      </div>
    </Screen>
  );
}

function WalletCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 'none',
        minWidth: 130,
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 12,
        border: `1.5px solid ${active ? 'var(--el-accent)' : 'var(--el-line)'}`,
        background: active ? 'var(--el-accent-soft)' : 'var(--el-surface)',
        cursor: onClick ? 'pointer' : 'default',
        opacity: active ? 1 : 0.7,
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? 'var(--el-accent-ink)' : 'var(--el-ink)' }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--el-muted)', marginTop: 2 }}>{value}</div>
    </button>
  );
}

function MethodOption({
  selected,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 12,
        border: `1.5px solid ${selected ? 'var(--el-accent)' : 'var(--el-line)'}`,
        background: selected ? 'var(--el-accent-soft)' : 'var(--el-surface)',
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--el-muted)', marginTop: 2 }}>{subtitle}</div>
      </div>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--el-accent)' : 'var(--el-faint)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        {selected && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--el-accent)' }} />}
      </span>
    </button>
  );
}
