import { Button, Icon, Screen, TextField } from '@ewallet-lab/ui';
import { useState } from 'react';

/**
 * Issue #3 — "create link" screen: amount + optional message → shareable URL. Structure loosely
 * adapted from MoMo's public Collection Link docs (merchant-side, not a confirmed P2P spec — see
 * backend DESIGN.md's "Điểm rẽ kiến trúc — PaymentRequest" section for the exact sourcing note).
 */
export function PaymentLinkCreate({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (amount: number, message: string) => Promise<string | null>;
}) {
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (amount === '' || amount <= 0) return;
    setLoading(true);
    const err = await onSubmit(amount, message.trim());
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen title="Tạo link nhận tiền" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 20, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 16px' }}>
        Bất kỳ ai có tài khoản Ewallet Lab và mở được đường link này đều có thể trả cho bạn — đây là
        đơn giản hoá có chủ đích cho lab học tập, không phải cơ chế bảo mật thực tế.
      </p>

      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '0 0 6px' }}>Số tiền cần nhận</p>
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
          marginBottom: 16,
        }}
      />

      <TextField
        id="link-message"
        label="Lời nhắn (không bắt buộc)"
        placeholder="Vd: Tiền ăn trưa hôm qua"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <Button onClick={submit} disabled={loading || amount === '' || amount <= 0}>
        {loading ? 'Đang tạo…' : 'Tạo link'}
      </Button>
    </Screen>
  );
}
