import {
  ApiError,
  STEP_UP_REQUIRED_STATUS,
  type FundDetailDto,
  type FundDto,
  type HoldingDto,
  type InvestmentOrderDto,
  investmentFundService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import {
  Button,
  Card,
  EmptyState,
  Icon,
  ProgressBar,
  Screen,
  StatusPill,
  StepUpModal,
  TextField,
  describeApiError,
  formatVnd,
} from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #25 — Sàn Đầu Tư (Sàn chứng chỉ quỹ mở mô phỏng, investment-fund-service).
 *
 * 4 ý disclaimer rủi ro thị trường bắt buộc theo quy định của Issue #25:
 * 1. Đây là mô phỏng học tập trong Ewallet Lab.
 * 2. KHÔNG PHẢI lời khuyên đầu tư thật.
 * 3. KHÔNG CÓ quỹ hay công ty quản lý quỹ thật nào đứng sau (Dragon Capital/IPAAM/SSIAM/VCBF
 *    chỉ là nguồn tham khảo mô hình hợp tác của MoMo, KHÔNG phải đối tác của lab).
 * 4. Giá trị "NAV" mô phỏng CÓ THỂ GIẢM — khác Túi Thần Tài (lãi suất cố định luôn dương),
 *    người dùng có thể chịu lỗ số dư mô phỏng, phải nói rõ ràng không úp mở.
 */
export const MARKET_RISK_DISCLAIMER_POINTS = [
  'Đây là mô phỏng học tập trong Ewallet Lab.',
  'KHÔNG PHẢI lời khuyên đầu tư thật — mọi số liệu đều phục vụ mục đích nghiên cứu hệ thống tài chính.',
  'KHÔNG CÓ quỹ/công ty quản lý quỹ thật nào đứng sau (Dragon Capital, SSIAM, VCBF, IPAAM chỉ là nguồn tham khảo mô hình đối tác thật của MoMo, KHÔNG phải đối tác của lab).',
  'Giá trị "NAV" mô phỏng CÓ THỂ GIẢM — khác Túi Thần Tài (lãi suất luôn dương), đầu tư chứng chỉ quỹ có rủi ro thị trường, người dùng CÓ THỂ BỊ THUA LỖ số dư mô phỏng.',
];

export const MARKET_RISK_BANNER =
  'Cảnh báo rủi ro: Mô phỏng học tập. Đầu tư chứng chỉ quỹ có rủi ro thị trường, NAV có thể giảm, không cam kết bảo toàn vốn.';

const DISCLAIMER_STORAGE_KEY = 'ewallet_investment_disclaimer_accepted_';

function isDisclaimerAccepted(userId: string): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY + userId) === 'true';
  } catch {
    return false;
  }
}

function setDisclaimerAccepted(userId: string): void {
  try {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY + userId, 'true');
  } catch {
    // Ignore storage errors
  }
}

function errorOf(e: unknown, context: 'investment-buy' | 'investment-sell'): string {
  return describeApiError(e instanceof ApiError ? e.status : undefined, context);
}

function formatPercent(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function formatUnits(units: number): string {
  return units.toLocaleString('vi-VN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

/** Banner cảnh báo rủi ro thường trực trên đỉnh mọi màn hình Sàn Đầu Tư */
function PermanentDisclaimerBanner({ onOpenDetails }: { onOpenDetails: () => void }) {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--el-amber-soft)',
        border: '1px solid var(--el-amber)',
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 14,
        color: 'var(--el-ink)',
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      <Icon name="warning" size={18} style={{ color: 'var(--el-amber)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <strong>{MARKET_RISK_BANNER}</strong>
      </div>
      <button
        onClick={onOpenDetails}
        style={{
          background: 'none',
          border: 0,
          color: 'var(--el-accent)',
          fontSize: 11.5,
          fontWeight: 700,
          cursor: 'pointer',
          padding: '2px 4px',
          whiteSpace: 'nowrap',
        }}
      >
        Chi tiết ›
      </button>
    </div>
  );
}

/** Modal chặn luồng hiển thị 4 ý cảnh báo rủi ro thị trường */
function MarketRiskDisclaimerModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--el-surface)',
          borderRadius: 18,
          maxWidth: 480,
          width: '100%',
          padding: '22px 20px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--el-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--el-amber-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="gavel" size={20} style={{ color: 'var(--el-amber)' }} />
          </span>
          <div>
            <h2
              style={{
                fontFamily: 'var(--el-font-display)',
                fontSize: 16,
                fontWeight: 800,
                margin: 0,
              }}
            >
              Cảnh báo rủi ro thị trường
            </h2>
            <div style={{ fontSize: 11.5, color: 'var(--el-muted)' }}>Sàn Đầu Tư · Chứng chỉ quỹ mở</div>
          </div>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
          Vui lòng đọc kỹ 4 điều khoản rủi ro thị trường trước khi tiếp tục:
        </p>

        <ol
          style={{
            margin: '0 0 16px',
            paddingLeft: 20,
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--el-ink)',
          }}
        >
          {MARKET_RISK_DISCLAIMER_POINTS.map((point, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              {point}
            </li>
          ))}
        </ol>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            background: 'var(--el-surface-2)',
            borderRadius: 10,
            cursor: 'pointer',
            marginBottom: 18,
            fontSize: 12.5,
            lineHeight: 1.45,
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ marginTop: 2, accentColor: 'var(--el-accent)', width: 17, height: 17 }}
          />
          <span style={{ color: 'var(--el-ink)', fontWeight: 600 }}>
            Tôi đã đọc, hiểu rõ 4 cảnh báo rủi ro thị trường (NAV có thể giảm) và đồng ý tham gia mô phỏng.
          </span>
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={onCancel}>
            Đóng
          </Button>
          <Button onClick={onConfirm} disabled={!checked}>
            Xác nhận & Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Exposed as `./InvestmentFund` (see vite.config.ts) */
export default function InvestmentFundScreen({
  session,
  onBack,
}: {
  session: Session;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'market' | 'portfolio'>('market');
  const [funds, setFunds] = useState<FundDto[]>([]);
  const [holdings, setHoldings] = useState<HoldingDto[]>([]);
  const [orders, setOrders] = useState<InvestmentOrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundDto | null>(null);
  const [fundDetail, setFundDetail] = useState<FundDetailDto | null>(null);

  // Buy & Sell Modal states
  const [buyFund, setBuyFund] = useState<FundDto | null>(null);
  const [buyAmount, setBuyAmount] = useState<string>('100000');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | undefined>();

  const [sellHolding, setSellHolding] = useState<HoldingDto | null>(null);
  const [sellUnits, setSellUnits] = useState<string>('');
  const [sellAll, setSellAll] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState<string | undefined>();

  // Step-up auth modal state (QĐ 2345/QĐ-NHNN)
  const [stepUpState, setStepUpState] = useState<{
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Market tick simulation feedback
  const [ticking, setTicking] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [fundsRes, holdingsRes, ordersRes, balRes] = await Promise.all([
        investmentFundService.listFunds().catch(() => []),
        investmentFundService.getUserHoldings(session.id).catch(() => []),
        investmentFundService.getUserOrders(session.id).catch(() => []),
        walletService.getBalance(session.id).catch(() => ({ balance: 0 })),
      ]);
      setFunds(fundsRes);
      setHoldings(holdingsRes);
      setOrders(ordersRes);
      setWalletBalance(balRes.balance);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // Check if user has previously acknowledged disclaimers
    if (!isDisclaimerAccepted(session.id)) {
      setShowDisclaimer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  async function handleViewFund(fund: FundDto) {
    setSelectedFund(fund);
    try {
      const detail = await investmentFundService.getFundDetail(fund.id);
      setFundDetail(detail);
    } catch {
      setFundDetail(null);
    }
  }

  async function handleSimulateTick() {
    setTicking(true);
    try {
      await investmentFundService.tickNav();
      await loadData();
      if (selectedFund) {
        const detail = await investmentFundService.getFundDetail(selectedFund.id);
        setFundDetail(detail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicking(false);
    }
  }

  async function executeBuy(stepUpConfirmed: boolean) {
    if (!buyFund) return;
    const numAmount = parseInt(buyAmount.replace(/\D/g, ''), 10);
    if (!numAmount || numAmount < 10000) {
      setBuyError('Số tiền đầu tư tối thiểu là 10.000đ.');
      return;
    }
    setBuyLoading(true);
    setBuyError(undefined);
    try {
      await investmentFundService.buy({
        userId: session.id,
        fundId: buyFund.id,
        amount: numAmount,
        disclaimerAccepted: true,
        stepUpConfirmed,
      });
      setBuyFund(null);
      setBuyAmount('100000');
      await loadData();
    } catch (e) {
      if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
        setStepUpState({
          message: e.message,
          onConfirm: async () => {
            setStepUpState(null);
            await executeBuy(true);
          },
        });
        return;
      }
      setBuyError(errorOf(e, 'investment-buy'));
    } finally {
      setBuyLoading(false);
    }
  }

  async function executeSell() {
    if (!sellHolding) return;
    const numUnits = parseFloat(sellUnits);
    if (!sellAll && (!numUnits || numUnits <= 0)) {
      setSellError('Số lượng CCQ bán không hợp lệ.');
      return;
    }
    setSellLoading(true);
    setSellError(undefined);
    try {
      await investmentFundService.sell({
        userId: session.id,
        fundId: sellHolding.fundId,
        units: numUnits || 0,
        sellAll,
      });
      setSellHolding(null);
      setSellUnits('');
      setSellAll(false);
      await loadData();
    } catch (e) {
      setSellError(errorOf(e, 'investment-sell'));
    } finally {
      setSellLoading(false);
    }
  }

  const totalInvested = holdings.reduce((sum, h) => sum + (h.totalInvested || 0), 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <Screen title="Sàn Đầu Tư" withNavGutter={false}>
      {/* Top back button & header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 0,
            color: 'var(--el-muted)',
            fontSize: 13,
            padding: 0,
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>

        <button
          onClick={handleSimulateTick}
          disabled={ticking}
          style={{
            background: 'var(--el-surface-2)',
            border: '1px solid var(--el-line)',
            borderRadius: 8,
            color: 'var(--el-accent-ink)',
            fontSize: 11.5,
            fontWeight: 700,
            padding: '4px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name="update" size={14} />
          {ticking ? 'Đang cập nhật phiên…' : 'Mô phỏng phiên NAV'}
        </button>
      </div>

      {/* Banner cảnh báo rủi ro thường trực */}
      <PermanentDisclaimerBanner onOpenDetails={() => setShowDisclaimer(true)} />

      {/* Navigation tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--el-surface-2)',
          borderRadius: 10,
          padding: 3,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => {
            setTab('market');
            setSelectedFund(null);
          }}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'market' ? 'var(--el-surface)' : 'none',
            color: tab === 'market' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'market' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'market' ? 'var(--el-shadow)' : 'none',
          }}
        >
          Khám phá Quỹ ({funds.length})
        </button>
        <button
          onClick={() => {
            setTab('portfolio');
            setSelectedFund(null);
          }}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: tab === 'portfolio' ? 'var(--el-surface)' : 'none',
            color: tab === 'portfolio' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: tab === 'portfolio' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'portfolio' ? 'var(--el-shadow)' : 'none',
          }}
        >
          Tài sản của tôi ({holdings.length})
        </button>
      </div>

      {loading && <ProgressBar label="Đang tải dữ liệu Sàn Đầu Tư…" />}

      {/* TAB 1: KHÁM PHÁ QUỸ (MARKETPLACE) */}
      {!loading && tab === 'market' && !selectedFund && (
        <div>
          <div style={{ fontSize: 12.5, color: 'var(--el-muted)', marginBottom: 12 }}>
            Danh sách chứng chỉ quỹ mở mô phỏng. Chọn một quỹ để xem lịch sử NAV và đặt lệnh:
          </div>

          {funds.length === 0 ? (
            <Card>
              <EmptyState icon="trending_up" text="Chưa có quỹ đầu tư nào được khởi tạo." />
            </Card>
          ) : (
            funds.map((fund) => {
              const isPositive = fund.returnRatePct >= 0;
              return (
                <div
                  key={fund.id}
                  onClick={() => handleViewFund(fund)}
                  style={{
                    background: 'var(--el-surface)',
                    border: '1px solid var(--el-line)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    marginBottom: 12,
                    cursor: 'pointer',
                    boxShadow: 'var(--el-shadow)',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--el-ink)' }}>{fund.code}</span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 6,
                            background:
                              fund.code === 'VF-GROWTH'
                                ? 'var(--el-danger-soft)'
                                : fund.code === 'VF-BALANCED'
                                  ? 'var(--el-amber-soft)'
                                  : 'var(--el-accent-soft)',
                            color:
                              fund.code === 'VF-GROWTH'
                                ? 'var(--el-danger)'
                                : fund.code === 'VF-BALANCED'
                                  ? 'var(--el-amber)'
                                  : 'var(--el-accent-ink)',
                          }}
                        >
                          {fund.code === 'VF-GROWTH' ? 'Rủi ro cao' : fund.code === 'VF-BALANCED' ? 'Rủi ro vừa' : 'Rủi ro thấp'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--el-muted)', marginTop: 2 }}>{fund.name}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                        {formatVnd(fund.nav)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isPositive ? 'var(--el-accent-ink)' : 'var(--el-danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 2,
                        }}
                      >
                        <Icon name={isPositive ? 'arrow_drop_up' : 'arrow_drop_down'} size={18} />
                        {formatPercent(fund.returnRatePct)}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '6px 0 0', lineHeight: 1.4 }}>
                    {fund.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CHI TIẾT QUỸ KHI CLICK VÀO 1 QUỸ */}
      {!loading && tab === 'market' && selectedFund && (
        <div>
          <button
            onClick={() => setSelectedFund(null)}
            style={{
              background: 'none',
              border: 0,
              color: 'var(--el-muted)',
              fontSize: 12.5,
              padding: 0,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            ← Danh sách quỹ
          </button>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{selectedFund.code}</h3>
                <div style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>{selectedFund.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{formatVnd(selectedFund.nav)}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: selectedFund.returnRatePct >= 0 ? 'var(--el-accent-ink)' : 'var(--el-danger)',
                  }}
                >
                  {formatPercent(selectedFund.returnRatePct)} so với giá ban đầu
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--el-muted)', lineHeight: 1.45, margin: '0 0 14px' }}>
              {selectedFund.description}
            </p>

            <div style={{ borderTop: '1px solid var(--el-line)', paddingTop: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Lịch sử biến động NAV:</div>
              {fundDetail?.history && fundDetail.history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {fundDetail.history.slice(-5).reverse().map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        padding: '4px 0',
                        borderBottom: '1px dashed var(--el-line)',
                      }}
                    >
                      <span style={{ color: 'var(--el-muted)' }}>
                        {new Date(h.recordedAt).toLocaleTimeString('vi-VN')}
                      </span>
                      <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{formatVnd(h.nav)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>Chưa có lịch sử phiên</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                onClick={() => {
                  setBuyFund(selectedFund);
                  setBuyAmount('100000');
                  setBuyError(undefined);
                }}
              >
                Đặt lệnh Mua CCQ
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: TÀI SẢN CỦA TÔI (PORTFOLIO) */}
      {!loading && tab === 'portfolio' && (
        <div>
          {/* Card tổng tài sản */}
          <Card>
            <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 2 }}>Tổng giá trị đầu tư</div>
            <div
              style={{
                fontFamily: 'var(--el-font-display)',
                fontSize: 22,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                marginBottom: 10,
              }}
            >
              {formatVnd(totalCurrentValue)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--el-line)', paddingTop: 8 }}>
              <span style={{ color: 'var(--el-muted)' }}>Tổng vốn đã mua:</span>
              <strong>{formatVnd(totalInvested)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
              <span style={{ color: 'var(--el-muted)' }}>Lợi nhuận tạm tính:</span>
              <strong style={{ color: totalProfit >= 0 ? 'var(--el-accent-ink)' : 'var(--el-danger)' }}>
                {totalProfit >= 0 ? '+' : ''}
                {formatVnd(totalProfit)} ({formatPercent(totalProfitPct)})
              </strong>
            </div>
          </Card>

          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '18px 0 8px' }}>Chứng chỉ quỹ đang nắm giữ</h3>
          {holdings.length === 0 ? (
            <Card>
              <EmptyState
                icon="account_balance_wallet"
                text="Bạn chưa sở hữu chứng chỉ quỹ nào. Chuyển sang tab Khám phá Quỹ để chọn và đặt lệnh mua."
              />
            </Card>
          ) : (
            holdings.map((h) => {
              const isProfit = h.profitAmount >= 0;
              return (
                <div
                  key={h.fundId}
                  style={{
                    background: 'var(--el-surface)',
                    border: '1px solid var(--el-line)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    marginBottom: 10,
                    boxShadow: 'var(--el-shadow)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{h.fundCode}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--el-muted)' }}>{h.fundName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{formatVnd(h.currentValue)}</div>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: isProfit ? 'var(--el-accent-ink)' : 'var(--el-danger)',
                        }}
                      >
                        {isProfit ? '+' : ''}
                        {formatVnd(h.profitAmount)} ({formatPercent(h.profitPct)})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--el-muted)', margin: '8px 0 10px' }}>
                    <span>Số lượng: {formatUnits(h.units)} CCQ</span>
                    <span>NAV hiện tại: {formatVnd(h.currentNav)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSellHolding(h);
                        setSellUnits(h.units.toString());
                        setSellAll(false);
                        setSellError(undefined);
                      }}
                    >
                      Bán CCQ
                    </Button>
                    <Button
                      onClick={() => {
                        const fund = funds.find((f) => f.id === h.fundId);
                        if (fund) {
                          setBuyFund(fund);
                          setBuyAmount('100000');
                          setBuyError(undefined);
                        }
                      }}
                    >
                      Mua thêm
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {/* Lịch sử lệnh */}
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '22px 0 8px' }}>Lịch sử đặt lệnh</h3>
          {orders.length === 0 ? (
            <Card>
              <EmptyState icon="history" text="Chưa có lệnh mua/bán nào được ghi nhận." />
            </Card>
          ) : (
            <Card>
              {orders.slice(0, 10).map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--el-line)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: o.type === 'BUY' ? 'var(--el-accent-soft)' : 'var(--el-surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name={o.type === 'BUY' ? 'north_east' : 'south_west'}
                        size={17}
                        style={{ color: o.type === 'BUY' ? 'var(--el-accent-ink)' : 'var(--el-muted)' }}
                      />
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {o.type === 'BUY' ? 'Mua' : 'Bán'} {o.fundCode}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--el-faint)' }}>
                        {new Date(o.createdAt).toLocaleString('vi-VN')} · {formatUnits(o.units)} CCQ
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {o.type === 'BUY' ? '-' : '+'}
                      {formatVnd(o.amount)}
                    </div>
                    <StatusPill status="MATCHED" />
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* MODAL ĐẶT LỆNH MUA CCQ */}
      {buyFund && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--el-surface)',
              borderRadius: 18,
              maxWidth: 440,
              width: '100%',
              padding: 20,
              boxShadow: 'var(--el-shadow)',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>Đặt lệnh Mua CCQ</h3>
            <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 14 }}>
              {buyFund.code} · {buyFund.name}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--el-surface-2)',
                borderRadius: 8,
                marginBottom: 14,
                fontSize: 12,
              }}
            >
              <span>NAV phiên hiện tại:</span>
              <strong>{formatVnd(buyFund.nav)} / CCQ</strong>
            </div>

            <TextField
              id="buyAmount"
              label="Số tiền muốn đầu tư (VNĐ)"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="VD: 100000"
              hint={`Số dư ví chính: ${formatVnd(walletBalance)} · Số CCQ dự kiến: ~${formatUnits(
                (parseInt(buyAmount.replace(/\D/g, ''), 10) || 0) / (buyFund.nav || 1),
              )} CCQ`}
            />

            {/* Quick amount pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {[50000, 100000, 500000, 1000000, 10000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBuyAmount(amt.toString())}
                  style={{
                    border: '1px solid var(--el-line)',
                    background: 'var(--el-surface)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    color: 'var(--el-ink)',
                  }}
                >
                  {formatVnd(amt)}
                </button>
              ))}
            </div>

            {buyError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 14px' }}>
                <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
                <span style={{ fontSize: 12, color: 'var(--el-danger)', fontWeight: 600 }}>{buyError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setBuyFund(null)} disabled={buyLoading}>
                Huỷ
              </Button>
              <Button onClick={() => executeBuy(false)} disabled={buyLoading}>
                {buyLoading ? 'Đang đặt lệnh…' : 'Xác nhận Mua'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐẶT LỆNH BÁN CCQ */}
      {sellHolding && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--el-surface)',
              borderRadius: 18,
              maxWidth: 440,
              width: '100%',
              padding: 20,
              boxShadow: 'var(--el-shadow)',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>Đặt lệnh Bán CCQ</h3>
            <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 14 }}>
              {sellHolding.fundCode} · {sellHolding.fundName}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--el-surface-2)',
                borderRadius: 8,
                marginBottom: 14,
                fontSize: 12,
              }}
            >
              <span>Số CCQ đang sở hữu:</span>
              <strong>{formatUnits(sellHolding.units)} CCQ</strong>
            </div>

            <TextField
              id="sellUnits"
              label="Số lượng CCQ muốn bán"
              value={sellAll ? sellHolding.units.toString() : sellUnits}
              onChange={(e) => {
                setSellAll(false);
                setSellUnits(e.target.value);
              }}
              placeholder={`Tối đa ${formatUnits(sellHolding.units)}`}
              hint={`Số tiền dự kiến nhận về ví chính: ~${formatVnd(
                (sellAll ? sellHolding.units : parseFloat(sellUnits) || 0) * sellHolding.currentNav,
              )}`}
            />

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={sellAll}
                  onChange={(e) => {
                    setSellAll(e.target.checked);
                    if (e.target.checked) {
                      setSellUnits(sellHolding.units.toString());
                    }
                  }}
                  style={{ accentColor: 'var(--el-accent)' }}
                />
                <span>Bán tất cả số CCQ đang nắm giữ</span>
              </label>
            </div>

            {sellError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 14px' }}>
                <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
                <span style={{ fontSize: 12, color: 'var(--el-danger)', fontWeight: 600 }}>{sellError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setSellHolding(null)} disabled={sellLoading}>
                Huỷ
              </Button>
              <Button onClick={executeSell} disabled={sellLoading}>
                {sellLoading ? 'Đang đặt lệnh…' : 'Xác nhận Bán'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHẶN LUỒNG CẢNH BÁO RỦI RO */}
      {showDisclaimer && (
        <MarketRiskDisclaimerModal
          onConfirm={() => {
            setDisclaimerAccepted(session.id);
            setShowDisclaimer(false);
          }}
          onCancel={() => {
            setShowDisclaimer(false);
          }}
        />
      )}

      {/* STEP-UP AUTHENTICATION MODAL (NẾU > 10M HOẶC VƯỢT HẠN MỨC NGÀY THEO QĐ 2345) */}
      {stepUpState && (
        <StepUpModal
          message={stepUpState.message}
          onConfirm={stepUpState.onConfirm}
          onCancel={() => setStepUpState(null)}
        />
      )}
    </Screen>
  );
}
