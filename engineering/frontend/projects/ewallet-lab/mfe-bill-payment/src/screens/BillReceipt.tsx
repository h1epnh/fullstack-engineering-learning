import type { BillPaymentReceipt } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StatusPill, formatVnd } from '@ewallet-lab/ui';
import { BILL_CATEGORIES } from '../categories';
import type { AutoDebitOption } from './BillConfirm';

export function BillReceipt({
  receipt,
  autoDebit,
  onDone,
}: {
  receipt: BillPaymentReceipt;
  autoDebit?: AutoDebitOption;
  onDone: () => void;
}) {
  const categoryLabel = BILL_CATEGORIES.find((c) => c.key === receipt.category)?.label ?? receipt.category;

  return (
    <Screen title="Thanh toán hoá đơn" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <Icon name="check_circle" size={40} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Thanh toán hoá đơn thành công</p>
          {receipt.discountAmount && receipt.discountAmount > 0 ? (
            <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>
              <div>Hoá đơn gốc: <span style={{ textDecoration: 'line-through' }}>{formatVnd(receipt.amount)}</span></div>
              <div style={{ color: 'var(--el-accent)', fontWeight: 700, margin: '2px 0' }}>
                Voucher giảm: -{formatVnd(receipt.discountAmount)}
              </div>
              <div>
                Thực trừ ví: <strong style={{ color: 'var(--el-ink)' }}>{formatVnd(receipt.finalAmount ?? (receipt.amount - receipt.discountAmount))}</strong> cho <strong>{categoryLabel}</strong> (mã KH {receipt.customerCode})
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0, textAlign: 'center' }}>
              Đã thanh toán <strong>{formatVnd(receipt.amount)}</strong> cho <strong>{categoryLabel}</strong> (mã KH {receipt.customerCode})
            </p>
          )}
          {receipt.paymentSource === 'BNPL_WALLET' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0', background: 'var(--el-accent-soft)', padding: '4px 10px', borderRadius: 8 }}>
              <Icon name="credit_card" size={16} style={{ color: 'var(--el-accent-ink)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-accent-ink)' }}>
                Nguồn tiền: Ví Trả Sau (BNPL)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0', background: 'var(--el-surface-2)', padding: '4px 10px', borderRadius: 8 }}>
              <Icon name="account_balance_wallet" size={16} style={{ color: 'var(--el-muted)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--el-ink)' }}>
                Nguồn tiền: Ví chính
              </span>
            </div>
          )}
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>
            {receipt.paymentSource === 'BNPL_WALLET'
              ? <>Hạn mức Ví Trả Sau còn lại: <strong>{formatVnd(receipt.newBalance)}</strong></>
              : <>Số dư ví chính mới: <strong>{formatVnd(receipt.newBalance)}</strong></>}
          </p>
        </div>
      </Card>

      {/* Issue #26: Auto-debit Confirmation Card */}
      {autoDebit?.enabled && (
        <div
          style={{
            marginTop: 14,
            padding: '14px 16px',
            background: 'var(--el-surface)',
            border: '1.5px solid var(--el-line)',
            borderRadius: 14,
            boxShadow: 'var(--el-shadow)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="autorenew" size={20} style={{ color: 'var(--el-accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Thanh toán tự động định kỳ</span>
            </div>
            <StatusPill status="ACTIVE" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '0 0 8px', lineHeight: 1.45 }}>
            Hoá đơn <strong>{categoryLabel}</strong> (mã KH: {receipt.customerCode}) các kỳ tiếp theo sẽ được tự động thanh toán từ <strong>Ví chính</strong>.
          </p>
          <div style={{ fontSize: 12, color: 'var(--el-ink)', fontWeight: 600 }}>
            Hạn mức tối đa/kỳ: {formatVnd(autoDebit.maxCap)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--el-faint)', marginTop: 4 }}>
            Nếu số tiền vượt hạn mức, hệ thống sẽ gửi thông báo để bạn xác nhận thủ công.
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button onClick={onDone}>Xong</Button>
      </div>
    </Screen>
  );
}
