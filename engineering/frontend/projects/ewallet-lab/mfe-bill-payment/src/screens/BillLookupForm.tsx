import type { BillCategory } from '@ewallet-lab/api-client';
import { Button, Icon, Screen, TextField } from '@ewallet-lab/ui';
import { useState } from 'react';
import { BILL_CATEGORIES } from '../categories';

/**
 * Mock biller lookup screen — no public MoMo spec for bill aggregation exists to bind this UI to
 * (README's "không có spec MoMo công khai" section), so this is designed after the universal
 * pattern every e-wallet bill-payment flow shares: pick a category, enter the customer's own
 * biller code, look up the due amount before paying anything.
 */
export function BillLookupForm({
  onLookup,
}: {
  onLookup: (category: BillCategory, customerCode: string) => Promise<string | null>;
}) {
  const [category, setCategory] = useState<BillCategory>('ELECTRICITY');
  const [customerCode, setCustomerCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (customerCode.trim().length === 0) return;
    setLoading(true);
    const err = await onLookup(category, customerCode.trim());
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen title="Thanh toán hoá đơn" withNavGutter={false}>
      <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 6px' }}>
        Đây là biller giả lập cho mục đích học tập — không phải tích hợp thật với nhà cung cấp dịch vụ nào.
      </p>

      <p style={{ fontSize: 13.5, fontWeight: 700, margin: '16px 0 10px' }}>Chọn loại hoá đơn</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
        {BILL_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCategory(c.key);
              setError(undefined);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '12px 6px',
              borderRadius: 12,
              border: `1.5px solid ${category === c.key ? 'var(--el-accent)' : 'var(--el-line)'}`,
              background: category === c.key ? 'var(--el-accent-soft)' : 'var(--el-surface)',
              cursor: 'pointer',
            }}
          >
            <Icon name={c.icon} size={20} style={{ color: category === c.key ? 'var(--el-accent-ink)' : 'var(--el-muted)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{c.label}</span>
          </button>
        ))}
      </div>

      <TextField
        id="customerCode"
        label="Mã khách hàng"
        placeholder="VD: PD01001234"
        value={customerCode}
        onChange={(e) => {
          setCustomerCode(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      <Button onClick={submit} disabled={loading || customerCode.trim().length === 0}>
        {loading ? 'Đang tra cứu…' : 'Tra cứu hoá đơn'}
      </Button>
    </Screen>
  );
}
