import { type SpendingPeriod, type SpendingReport as SpendingReportData, walletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Card, Icon, ProgressBar, Screen, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #16 — "Quản lý chi tiêu" MVP, "Báo cáo chi tiêu tự động". Nguồn MoMo thật
 * (momo.vn/quan-ly-chi-tieu, agent-designer fetch trực tiếp 2026-10-03): tính năng thật có 4 tab
 * (Sổ chi tiêu theo danh mục tự đặt, Ngân sách, Báo cáo tuần/tháng, Chatbot trợ lý chi tiêu) — màn
 * này CHỈ làm phần "Báo cáo", hoàn toàn read-only trên `Transaction` ledger có sẵn trong
 * `wallet-service`, không có category tự do/ngân sách/chatbot (xem backend+frontend DESIGN.md's
 * "Ngoài phạm vi" cho lý do cắt).
 *
 * Định nghĩa "chi tiêu" giữ đúng `Home.tsx`'s `SPEND_TYPES`: WITHDRAW + TRANSFER_OUT +
 * BILL_PAYMENT — KHÔNG tính TOPUP/TRANSFER_IN/REFUND.
 */
const BREAKDOWN_META: Record<string, { icon: string; label: string }> = {
  WITHDRAW: { icon: 'north', label: 'Rút tiền' },
  TRANSFER_OUT: { icon: 'north_east', label: 'Chuyển tiền' },
  BILL_PAYMENT: { icon: 'receipt_long', label: 'Thanh toán hoá đơn' },
};

const BREAKDOWN_ORDER = ['WITHDRAW', 'TRANSFER_OUT', 'BILL_PAYMENT'] as const;

export default function SpendingReport({ session, onBack }: { session: Session; onBack: () => void }) {
  const [period, setPeriod] = useState<SpendingPeriod>('month');
  const [report, setReport] = useState<SpendingReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    walletService.getSpendingReport(session.id, period).then((data) => {
      if (!cancelled) {
        setReport(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session.id, period]);

  const total = report?.total ?? 0;

  return (
    <Screen title="Quản lý chi tiêu" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 14px' }}>
        Báo cáo tự động tổng hợp từ lịch sử giao dịch — không cần nhập tay. Chỉ tính rút tiền,
        chuyển tiền đi và thanh toán hoá đơn; nạp tiền/nhận tiền không tính là chi tiêu.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: '1px solid var(--el-line)',
              background: period === p ? 'var(--el-accent)' : 'var(--el-surface)',
              color: period === p ? '#fff0f6' : 'var(--el-ink)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            {p === 'week' ? 'Tuần này' : 'Tháng này'}
          </button>
        ))}
      </div>

      {loading ? (
        <ProgressBar label="Đang tính báo cáo chi tiêu…" />
      ) : (
        <>
          <Card>
            <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 4 }}>
              Tổng chi tiêu {period === 'week' ? 'tuần này' : 'tháng này'}
            </div>
            <div
              style={{
                fontFamily: 'var(--el-font-display)',
                fontSize: 24,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatVnd(total)}
            </div>
          </Card>

          <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
            Theo loại giao dịch
          </h2>
          <Card>
            {BREAKDOWN_ORDER.map((type, i) => {
              const amount = report?.breakdown[type] ?? 0;
              const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
              const meta = BREAKDOWN_META[type];
              return (
                <div key={type} style={{ marginBottom: i < BREAKDOWN_ORDER.length - 1 ? 14 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon name={meta.icon} size={16} style={{ color: 'var(--el-muted)' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{meta.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatVnd(amount)}
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--el-line)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--el-accent)' }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '14px 2px' }}>
            Nguồn ý tưởng: momo.vn/quan-ly-chi-tieu — MVP của lab này chỉ làm phần "Báo cáo", chưa
            có danh mục tự đặt, Ngân sách hay Chatbot trợ lý chi tiêu (xem DESIGN.md).
          </p>
        </>
      )}
    </Screen>
  );
}
