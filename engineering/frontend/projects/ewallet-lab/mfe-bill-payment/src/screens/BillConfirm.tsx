import type { BillLookupResponse } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';
import { BILL_CATEGORIES } from '../categories';

export function BillConfirm({
  bill,
  onBack,
  onConfirm,
}: {
  bill: BillLookupResponse;
  onBack: () => void;
  onConfirm: () => Promise<string | null>;
}) {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const categoryLabel = BILL_CATEGORIES.find((c) => c.key === bill.category)?.label ?? bill.category;

  async function submit() {
    setLoading(true);
    const err = await onConfirm();
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 20, cursor: 'pointer' }}
      >
        ← Đổi mã khách hàng
      </button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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
            <Icon name="receipt_long" size={22} style={{ color: 'var(--el-accent-ink)' }} />
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{categoryLabel}</div>
            <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{bill.customerName} · {bill.customerCode}</div>
          </div>
        </div>
        <Row label="Kỳ thanh toán" value={bill.period} />
        <Row label="Số tiền" value={formatVnd(bill.amount)} strong />
      </Card>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '16px 0 0' }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button onClick={submit} disabled={loading}>
          {loading ? 'Đang thanh toán…' : `Xác nhận thanh toán ${formatVnd(bill.amount)}`}
        </Button>
      </div>
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--el-line)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>{label}</span>
      <span style={{ fontSize: strong ? 15 : 12.5, fontWeight: strong ? 800 : 600 }}>{value}</span>
    </div>
  );
}
