import { type Transaction, savingsPocketService, walletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import {
  Card,
  EmptyState,
  Icon,
  NotificationBell,
  ProgressBar,
  QuickAction,
  Screen,
  TransactionRow,
  formatVnd,
} from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';
import { buildNotifications, loadReadIds } from '../notifications';

/**
 * Structure below mirrors the real MoMo app's actual home screen (analyzed from first-hand
 * screenshots, not the momo.vn marketing site — that's a different, broader list used instead
 * for the AllServices "Xem thêm dịch vụ" page): a strip of separate wallet types, a 4-icon quick
 * row, a compact 7-tile grid, then a scrollable feed of widget cards (spending summary, tips,
 * promo teasers) below — not just a transaction list. Only the main wallet balance, Nạp/Rút, and
 * the monthly-spend card are backed by real data; everything else is comingSoon or a generic
 * teaser. Deliberately not fabricating specific third-party content (movie titles/ratings, deal
 * amounts, brand names like Samsung/Shopee/Sting seen in the real screenshots) since none of that
 * has any real backend or partner behind it here — see DESIGN.md disclaimer.
 */
const QUICK_ROW: { key: string; icon: string; label: string; real?: boolean }[] = [
  { key: 'topup-withdraw', icon: 'credit_card', label: 'Nạp/Rút', real: true },
  { key: 'receive', icon: 'call_received', label: 'Nhận tiền', real: true },
  { key: 'qr-pay', icon: 'qr_code_scanner', label: 'QR Thanh toán', real: true },
  { key: 'utility-wallet', icon: 'folder_open', label: 'Ví tiện ích' },
];

const MAIN_GRID: { key: string; icon: string; label: string; more?: boolean; real?: boolean }[] = [
  { key: 'transfer', icon: 'north_east', label: 'Chuyển tiền', real: true },
  { key: 'bank-transfer', icon: 'account_balance', label: 'Chuyển tiền\nNgân hàng' },
  { key: 'bill-payment', icon: 'receipt_long', label: 'Thanh toán\nhoá đơn', real: true },
  { key: 'phone-topup', icon: 'call', label: 'Nạp tiền\nđiện thoại', real: true },
  { key: 'phone-data', icon: 'signal_cellular_alt', label: 'Data 4G/5G' },
  { key: 'family-wallet', icon: 'family_restroom', label: 'Ví Gia\nđình', real: true },
  { key: 'spending', icon: 'bar_chart', label: 'Quản lý\nchi tiêu', real: true },
  { key: 'more-services', icon: 'more_horiz', label: 'Xem thêm\ndịch vụ', more: true },
];

const FEED_TEASERS: { key: string; icon: string; title: string; subtitle: string }[] = [
  { key: 'movie-tickets', icon: 'local_movies', title: 'Vé xem phim & sự kiện', subtitle: 'Xem danh sách rạp, lịch chiếu' },
  // Issue #19: "tích điểm" split out into its own, real entry; the rest stays a coming-soon teaser.
  { key: 'loyalty', icon: 'loyalty', title: 'Điểm thưởng', subtitle: 'Tích điểm khi thanh toán hoá đơn, đổi hoàn tiền' },
  // Issue #28: Gói Voucher Hội viên (Voucher Pass)
  { key: 'voucher-pass', icon: 'sell', title: 'Gói Voucher Hội Viên', subtitle: 'Tiết kiệm đến 40.000đ khi thanh toán hoá đơn (mô phỏng)' },
  // Untouched by issue #18 on purpose: this teaser also advertises "vay nhanh", which is out of scope.
  { key: 'finance-insurance', icon: 'credit_card', title: 'Ví Trả Sau, vay nhanh', subtitle: 'Sản phẩm tài chính đối tác' },
  // Issue #25: Sàn Đầu Tư (chứng chỉ quỹ mở mô phỏng)
  { key: 'investment-fund', icon: 'trending_up', title: 'Sàn Đầu Tư', subtitle: 'Chứng chỉ quỹ mở · Rủi ro thị trường NAV (mô phỏng)' },
  // Issue #27: Heo Tiết Kiệm (Mục tiêu tiết kiệm)
  { key: 'savings-goals', icon: 'savings', title: 'Heo Tiết Kiệm', subtitle: 'Tích luỹ mục tiêu cá nhân · Tách riêng ví chính (mô phỏng)' },
];

const SPEND_TYPES = new Set(['WITHDRAW', 'TRANSFER_OUT', 'BILL_PAYMENT']);

function monthlySpend(transactions: Transaction[]): number {
  const now = new Date();
  return transactions
    .filter((tx) => {
      const d = new Date(tx.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && SPEND_TYPES.has(tx.type)
      );
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/** Simple rule-based tip, not real AI — labeled plainly so it doesn't overclaim. */
function todaysTip(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Buổi sáng tốt lành! Kiểm tra số dư trước khi bắt đầu ngày mới nhé.';
  if (hour < 14) return 'Giờ nghỉ trưa rồi — tiện thể xem lại vài giao dịch gần đây không?';
  if (hour < 18) return 'Buổi chiều rồi, nạp thêm tiền nếu số dư sắp cạn nhé.';
  return 'Cuối ngày rồi, xem lại chi tiêu hôm nay trước khi nghỉ ngơi nhé.';
}

function MiniWallet({
  label,
  value,
  comingSoon,
  onClick,
}: {
  label: string;
  value: string;
  comingSoon?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </>
  );
  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{ flex: 1, textAlign: 'center', background: 'none', border: 0, padding: 0, color: 'inherit', cursor: 'pointer' }}
      >
        {content}
      </button>
    );
  }
  return <div style={{ flex: 1, textAlign: 'center', opacity: comingSoon ? 0.5 : 1 }}>{content}</div>;
}

function FeedTeaser({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
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
        background: 'var(--el-surface)',
        border: '1px solid var(--el-line)',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        boxShadow: 'var(--el-shadow)',
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--el-accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={icon} size={19} style={{ color: 'var(--el-accent-ink)' }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>{subtitle}</div>
      </div>
      <span style={{ color: 'var(--el-faint)', fontSize: 11.5, fontWeight: 700 }}>Sắp ra mắt</span>
    </button>
  );
}

/** Exposed as `./Home` (see vite.config.ts). */
export default function Home({
  session,
  onTopup,
  onTransfer,
  onBillPayment,
  onReceive,
  onMoreServices,
  onComingSoon,
  onOpenNotifications,
  onBnpl,
  onLoyalty,
  onSavingsPocket,
  onFamilyWallet,
  onSpendingReport,
  onInvestmentFund,
  onSavingsGoals,
  onVoucherPass,
}: {
  session: Session;
  onTopup: () => void;
  onTransfer: () => void;
  onBillPayment: () => void;
  onReceive: () => void;
  onMoreServices: () => void;
  onComingSoon: (feature: string) => void;
  onOpenNotifications: () => void;
  /** Issue #18 — optional so an older shell (deployed separately) still works: falls back to the
   * generic coming-soon screen. */
  onBnpl?: () => void;
  /** Issue #19 — optional for the same reason as onBnpl. */
  onLoyalty?: () => void;
  onSavingsPocket: () => void;
  onFamilyWallet: () => void;
  onSpendingReport: () => void;
  /** Issue #25 — Sàn Đầu Tư */
  onInvestmentFund?: () => void;
  /** Issue #27 — Heo Tiết Kiệm */
  onSavingsGoals?: () => void;
  /** Issue #28 — Gói Voucher Hội viên */
  onVoucherPass?: () => void;
  /** Issue #29 — Nạp tiền ĐT & Mua mã thẻ cào */
  onPhoneTopup?: () => void;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [pocketOpened, setPocketOpened] = useState(false);
  const [pocketBalance, setPocketBalance] = useState(0);

  async function refresh() {
    setLoading(true);
    const [balanceRes, txRes, pocketRes] = await Promise.all([
      walletService.getBalance(session.id),
      walletService.getTransactions(session.id),
      savingsPocketService.view(session.id),
    ]);
    setBalance(balanceRes.balance);
    setTransactions(txRes);
    setReadIds(loadReadIds(session.id));
    setPocketOpened(pocketRes.opened);
    setPocketBalance(pocketRes.balance);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const unreadCount = buildNotifications(transactions).filter((n) => !readIds.has(n.id)).length;

  function handleGridClick(item: { key: string; more?: boolean; real?: boolean }) {
    if (item.more) onMoreServices();
    else if (item.key === 'transfer') onTransfer();
    else if (item.key === 'bill-payment') onBillPayment();
    else if (item.key === 'phone-topup') {
      if (onPhoneTopup) onPhoneTopup();
      else onComingSoon(item.key);
    }
    else if (item.key === 'family-wallet') onFamilyWallet();
    else if (item.key === 'spending') onSpendingReport();
    else if (item.real) onTransfer();
    else onComingSoon(item.key);
  }

  const monthLabel = new Date().toLocaleDateString('vi-VN', { month: 'long' });

  return (
    <Screen>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 4px' }}>Xin chào,</p>
          <h1 style={{ fontFamily: 'var(--el-font-display)', fontSize: 19, fontWeight: 800, margin: 0 }}>
            {session.name}
          </h1>
        </div>
        <NotificationBell count={unreadCount} onClick={onOpenNotifications} />
      </div>

      {/* Quick row — 4 icons, matches real app's top action row */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {QUICK_ROW.map((item) => (
          <QuickAction
            key={item.key}
            icon={item.icon}
            label={item.label}
            comingSoon={!item.real}
            onClick={
              item.key === 'topup-withdraw'
                ? onTopup
                : item.key === 'receive'
                  ? onReceive
                  : item.key === 'qr-pay'
                    ? onTransfer
                    : () => onComingSoon(item.key)
            }
          />
        ))}
      </div>

      {/* Multi-wallet strip — only the main wallet is real */}
      <Card>
        <div style={{ display: 'flex' }}>
          <MiniWallet label="Ví chính" value={loading ? '···' : formatVnd(balance ?? 0)} />
          <div style={{ width: 1, background: 'var(--el-line)' }} />
          <MiniWallet
            label="Ví Trả Sau"
            value="Mô phỏng ›"
            onClick={onBnpl ?? (() => onComingSoon('bnpl'))}
          />
          <div style={{ width: 1, background: 'var(--el-line)' }} />
          <MiniWallet
            label="Túi Thần Tài"
            value={loading ? '···' : pocketOpened ? formatVnd(pocketBalance) : 'Chưa mở'}
            onClick={onSavingsPocket}
          />
        </div>
      </Card>

      {/* Issue #25: Sàn Đầu Tư entry strip */}
      <div
        onClick={onInvestmentFund ?? (() => onComingSoon('investment-fund'))}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--el-surface)',
          border: '1px solid var(--el-line)',
          borderRadius: 12,
          padding: '10px 14px',
          marginTop: 8,
          cursor: 'pointer',
          boxShadow: 'var(--el-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--el-accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="trending_up" size={18} style={{ color: 'var(--el-accent-ink)' }} />
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Sàn Đầu Tư</div>
            <div style={{ fontSize: 11, color: 'var(--el-muted)' }}>Chứng chỉ quỹ mở · Rủi ro thị trường NAV</div>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-accent)' }}>Khám phá ›</span>
      </div>

      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
        Dịch vụ
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px 4px', marginBottom: 24 }}>
        {MAIN_GRID.map((item) => (
          <QuickAction
            key={item.key}
            icon={item.icon}
            label={item.label.replace('\n', ' ')}
            comingSoon={!item.more && !item.real}
            onClick={() => handleGridClick(item)}
          />
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '0 0 8px' }}>
        Giao dịch gần đây
      </h2>
      <Card>
        {loading ? (
          <ProgressBar label="Đang tải giao dịch…" />
        ) : transactions.length === 0 ? (
          <EmptyState icon="inbox" text="Chưa có giao dịch nào. Nạp tiền để bắt đầu." />
        ) : (
          transactions
            .slice(0, 3)
            .map((tx) => (
              <TransactionRow key={tx.id} type={tx.type} amount={tx.amount} note={tx.note} createdAt={tx.createdAt} />
            ))
        )}
      </Card>

      {/* Chi tiêu tháng này — real, computed from actual transaction history (not illustrative) */}
      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '24px 0 8px' }}>
        Chi tiêu tháng {monthLabel}
      </h2>
      <Card>
        <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 4 }}>Tổng chi (nạp/rút, chuyển đi, hoá đơn)</div>
        <div
          style={{
            fontFamily: 'var(--el-font-display)',
            fontSize: 22,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {loading ? '···' : formatVnd(monthlySpend(transactions))}
        </div>
      </Card>

      {/* Mẹo hôm nay — simple rule-based tip, plainly not real AI */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          background: 'var(--el-accent-soft)',
          borderRadius: 12,
          padding: '12px 14px',
          margin: '14px 0',
        }}
      >
        <Icon name="lightbulb" size={18} style={{ color: 'var(--el-accent-ink)' }} />
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--el-accent-ink)', marginBottom: 2 }}>
            Mẹo hôm nay
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--el-ink)', margin: 0 }}>{todaysTip()}</p>
        </div>
      </div>

      {/* Feed teasers — generic, not fabricated third-party brand/content */}
      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '10px 0 8px' }}>
        Khám phá thêm
      </h2>
      {FEED_TEASERS.map((t) => (
        <FeedTeaser
          key={t.key}
          icon={t.icon}
          title={t.title}
          subtitle={t.subtitle}
          onClick={() => {
            if (t.key === 'loyalty' && onLoyalty) onLoyalty();
            else if (t.key === 'investment-fund' && onInvestmentFund) onInvestmentFund();
            else if (t.key === 'savings-goals' && onSavingsGoals) onSavingsGoals();
            else if (t.key === 'voucher-pass' && onVoucherPass) onVoucherPass();
            else onComingSoon(t.key);
          }}
        />
      ))}
    </Screen>
  );
}
