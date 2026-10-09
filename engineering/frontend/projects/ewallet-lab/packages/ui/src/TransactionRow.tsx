import { formatVnd } from './BalanceCard';
import { Icon } from './Icon';

export type TransactionType =
  | 'TOPUP'
  | 'WITHDRAW'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'BILL_PAYMENT'
  | 'REFUND'
  | 'BNPL_REPAYMENT'
  | 'LOYALTY_REDEMPTION'
  | 'INVESTMENT_BUY'
  | 'INVESTMENT_SELL'
  | 'SAVINGS_GOAL_DEPOSIT'
  | 'SAVINGS_GOAL_WITHDRAW'
  | 'VOUCHER_PASS_PURCHASE';

/** Issue #36 — bổ sung `REFUND`/`SAVINGS_GOAL_DEPOSIT`/`SAVINGS_GOAL_WITHDRAW`/
 * `VOUCHER_PASS_PURCHASE` (trước đây thiếu — gap có từ trước, lộ ra khi History giờ hiển thị toàn
 * bộ ledger qua bộ lọc mới, không chỉ các loại đã được thêm vào union type trước đó). `sign` khớp
 * đúng `TransactionType.direction()` phía backend (wallet-service) — xem DESIGN.md issue #36. */
const TYPE_META: Record<TransactionType, { icon: string; label: string; sign: 1 | -1 }> = {
  TOPUP: { icon: 'south', label: 'Nạp tiền', sign: 1 },
  WITHDRAW: { icon: 'north', label: 'Rút tiền', sign: -1 },
  TRANSFER_OUT: { icon: 'north_east', label: 'Chuyển tiền', sign: -1 },
  TRANSFER_IN: { icon: 'south_west', label: 'Nhận tiền', sign: 1 },
  BILL_PAYMENT: { icon: 'receipt_long', label: 'Thanh toán hoá đơn', sign: -1 },
  REFUND: { icon: 'replay', label: 'Hoàn tiền', sign: 1 },
  BNPL_REPAYMENT: { icon: 'credit_card', label: 'Trả nợ Ví Trả Sau', sign: -1 },
  LOYALTY_REDEMPTION: { icon: 'loyalty', label: 'Hoàn tiền từ điểm thưởng', sign: 1 },
  INVESTMENT_BUY: { icon: 'trending_up', label: 'Mua chứng chỉ quỹ', sign: -1 },
  INVESTMENT_SELL: { icon: 'savings', label: 'Bán chứng chỉ quỹ', sign: 1 },
  SAVINGS_GOAL_DEPOSIT: { icon: 'savings', label: 'Gửi mục tiêu tiết kiệm', sign: -1 },
  SAVINGS_GOAL_WITHDRAW: { icon: 'savings', label: 'Rút mục tiêu tiết kiệm', sign: 1 },
  VOUCHER_PASS_PURCHASE: { icon: 'confirmation_number', label: 'Mua Voucher Pass', sign: -1 },
};

export function TransactionRow({
  type,
  amount,
  note,
  createdAt,
}: {
  type: TransactionType;
  amount: number;
  note?: string | null;
  createdAt: string;
}) {
  const meta = TYPE_META[type] ?? { icon: 'help', label: type, sign: 1 as const };
  const date = new Date(createdAt);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 0',
        borderBottom: '1px solid var(--el-line)',
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--el-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={meta.icon} size={17} style={{ color: 'var(--el-muted)' }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{meta.label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>
          {note ? `${note} · ` : ''}
          {date.toLocaleString('vi-VN')}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--el-font-display)',
          fontWeight: 700,
          fontSize: 13.5,
          fontVariantNumeric: 'tabular-nums',
          color: meta.sign > 0 ? 'var(--el-accent-ink)' : 'var(--el-ink)',
          whiteSpace: 'nowrap',
        }}
      >
        {meta.sign > 0 ? '+' : '-'}
        {formatVnd(amount)}
      </div>
    </div>
  );
}
