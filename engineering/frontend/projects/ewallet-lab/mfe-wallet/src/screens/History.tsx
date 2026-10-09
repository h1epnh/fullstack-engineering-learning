import {
  type AccountStatement,
  type Transaction,
  type TransactionDirection,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, EmptyState, Icon, ProgressBar, Screen, TextField, TransactionRow, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PAGE_SIZE = 20;

type DirectionTab = 'ALL' | TransactionDirection;

/**
 * Issue #36 — "Bộ lọc lịch sử giao dịch thông minh & Xuất sao kê tài chính". Nguồn khảo sát từ
 * ticket (MoMo/Vietcombank/Techcombank/VNPay): tab lọc nhanh theo dòng tiền (Tất cả/Tiền vào/Tiền
 * ra), lọc theo khoảng ngày, phân trang, và xuất sao kê tháng (tóm tắt đầu kỳ→cuối kỳ + tải CSV).
 * Trước ticket này, màn hình chỉ gọi `getTransactions` (toàn bộ ledger không lọc/không phân trang)
 * — giờ dùng `searchTransactions` (issue #36's backend search, server-side filter + pagination).
 */
export default function History({ session }: { session: Session }) {
  const [direction, setDirection] = useState<DirectionTab>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);

  useEffect(() => {
    setTransactions(null);
    setPage(0);
    walletService
      .searchTransactions(session.id, {
        direction: direction === 'ALL' ? undefined : direction,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        // toDate từ <input type="date"> là 00:00 của NGÀY ĐÓ — cộng thêm 1 ngày để bao gồm trọn
        // ngày được chọn (backend's toDate là exclusive upper bound, xem WalletService#searchTransactions).
        toDate: toDate ? new Date(new Date(toDate).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        page: 0,
        size: PAGE_SIZE,
      })
      .then((result) => {
        setTransactions(result.transactions);
        setTotalPages(result.totalPages);
      });
  }, [session.id, direction, fromDate, toDate]);

  function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    walletService
      .searchTransactions(session.id, {
        direction: direction === 'ALL' ? undefined : direction,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(new Date(toDate).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        page: nextPage,
        size: PAGE_SIZE,
      })
      .then((result) => {
        setTransactions((prev) => [...(prev ?? []), ...result.transactions]);
        setPage(nextPage);
        setLoadingMore(false);
      });
  }

  return (
    <Screen title="Lịch sử giao dịch">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['ALL', 'IN', 'OUT'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDirection(tab)}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 10,
              border: '1px solid var(--el-line)',
              background: direction === tab ? 'var(--el-accent)' : 'var(--el-surface)',
              color: direction === tab ? '#fff0f6' : 'var(--el-ink)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {tab === 'ALL' ? 'Tất cả' : tab === 'IN' ? 'Tiền vào (+)' : 'Tiền ra (-)'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
        <TextField label="Từ ngày" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <TextField label="Đến ngày" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <Button variant="ghost" onClick={() => setStatementOpen(true)} style={{ marginBottom: 16 }}>
        <Icon name="description" size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Xuất sao kê tháng
      </Button>

      <Card>
        {transactions === null ? (
          <ProgressBar label="Đang tải…" />
        ) : transactions.length === 0 ? (
          <EmptyState icon="inbox" text="Không có giao dịch nào khớp bộ lọc." />
        ) : (
          transactions.map((tx) => (
            <TransactionRow key={tx.id} type={tx.type} amount={tx.amount} note={tx.note} createdAt={tx.createdAt} />
          ))
        )}
      </Card>

      {transactions !== null && page + 1 < totalPages && (
        <Button variant="secondary" onClick={loadMore} disabled={loadingMore} style={{ marginTop: 12 }}>
          {loadingMore ? 'Đang tải…' : 'Tải thêm giao dịch'}
        </Button>
      )}

      {statementOpen && <StatementModal session={session} onClose={() => setStatementOpen(false)} />}
    </Screen>
  );
}

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Modal "Xuất sao kê tháng" — chọn tháng → xem tóm tắt (Số dư đầu kỳ → Tổng thu → Tổng chi → Số
 * dư cuối kỳ) → tải CSV. Tóm tắt luôn tải lại khi đổi tháng (không cache giữa các tháng). */
function StatementModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const [month, setMonth] = useState(currentMonthValue());
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    walletService.getStatement(session.id, month).then((data) => {
      setStatement(data);
      setLoading(false);
    });
  }, [session.id, month]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 10, 20, 0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--el-surface)',
          borderRadius: '18px 18px 0 0',
          padding: '24px 20px calc(20px + var(--el-safe-bottom, 0px))',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
        }}
      >
        <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>
          Xuất sao kê tài chính
        </h2>

        <TextField label="Chọn tháng" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />

        {loading || !statement ? (
          <ProgressBar label="Đang tính sao kê…" />
        ) : (
          <>
            <Card>
              <StatementRow label="Số dư đầu kỳ" value={statement.openingBalance} />
              <StatementRow label="Tổng tiền vào" value={statement.totalCredits} positive />
              <StatementRow label="Tổng tiền ra" value={statement.totalDebits} negative />
              <div style={{ borderTop: '1px solid var(--el-line)', margin: '10px 0' }} />
              <StatementRow label="Số dư cuối kỳ" value={statement.closingBalance} bold />
            </Card>
            <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '10px 2px 16px' }}>
              {statement.transactionsCount} giao dịch trong kỳ.
            </p>
            <Button
              onClick={() => window.open(walletService.getStatementCsvUrl(session.id, month), '_blank')}
              style={{ marginBottom: 10 }}
            >
              Tải file CSV sao kê
            </Button>
          </>
        )}
        <Button variant="ghost" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}

function StatementRow({
  label,
  value,
  positive,
  negative,
  bold,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: bold ? 14.5 : 13 }}>
      <span style={{ color: 'var(--el-muted)', fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span
        style={{
          fontWeight: bold ? 800 : 700,
          fontVariantNumeric: 'tabular-nums',
          color: positive ? 'var(--el-accent-ink)' : negative ? 'var(--el-danger)' : 'var(--el-ink)',
        }}
      >
        {positive ? '+' : negative ? '-' : ''}
        {formatVnd(value)}
      </span>
    </div>
  );
}
