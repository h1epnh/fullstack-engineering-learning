import type { UserResponse } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

export function TransferAmount({
  recipient,
  onBack,
  onSubmit,
}: {
  recipient: UserResponse;
  onBack: () => void;
  onSubmit: (amount: number) => Promise<string | null>;
}) {
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (amount === '' || amount <= 0) return;
    setLoading(true);
    const err = await onSubmit(amount);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 20, cursor: 'pointer' }}
      >
        ← Đổi người nhận
      </button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--el-accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <Icon name="person" size={22} style={{ color: 'var(--el-accent-ink)' }} />
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{recipient.name}</div>
            <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{recipient.phone}</div>
          </div>
        </div>
      </Card>

      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '20px 0 6px' }}>Số tiền</p>
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
          border: `1.5px solid ${error ? 'var(--el-danger)' : 'var(--el-line)'}`,
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          marginBottom: 6,
        }}
      />
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}
      {!error && <div style={{ marginBottom: 20 }} />}

      <Button onClick={submit} disabled={loading || amount === '' || amount <= 0}>
        {loading ? 'Đang chuyển…' : `Chuyển ${amount ? formatVnd(amount) : ''}`}
      </Button>
    </Screen>
  );
}
