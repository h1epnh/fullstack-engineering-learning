import type { BillPaymentReceipt } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { BILL_CATEGORIES } from '../categories';

export function BillReceipt({ receipt, onDone }: { receipt: BillPaymentReceipt; onDone: () => void }) {
  const categoryLabel = BILL_CATEGORIES.find((c) => c.key === receipt.category)?.label ?? receipt.category;

  return (
    <Screen title="Thanh toán hoá đơn" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <Icon name="check_circle" size={40} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Thanh toán hoá đơn thành công</p>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0, textAlign: 'center' }}>
            Đã thanh toán <strong>{formatVnd(receipt.amount)}</strong> cho <strong>{categoryLabel}</strong> (mã KH {receipt.customerCode})
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>
            Số dư mới: <strong>{formatVnd(receipt.newBalance)}</strong>
          </p>
        </div>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Button onClick={onDone}>Xong</Button>
      </div>
    </Screen>
  );
}
