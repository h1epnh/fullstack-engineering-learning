import {
  ApiError,
  type PassPackageDefinition,
  type VoucherDto,
  voucherPassService,
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
  describeApiError,
  formatVnd,
} from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #28 — Cơ chế Voucher Pass (Gói Voucher Hội viên tiết kiệm)
 * Mở rộng trực tiếp trên loyalty-service (Phương án 2 / b).
 * Mua gói pass bằng tiền ví chính với loại giao dịch VOUCHER_PASS_PURCHASE.
 * Cấp bộ voucher giảm giá tự động dùng trong bill-payment-service.
 */

type Tab = 'catalog' | 'my-vouchers';

export default function VoucherPass({
  session,
  onBack,
  onGoToBillPayment,
}: {
  session: Session;
  onBack: () => void;
  onGoToBillPayment?: () => void;
}) {
  const [tab, setTab] = useState<Tab>('catalog');
  const [packages, setPackages] = useState<PassPackageDefinition[]>([]);
  const [myVouchers, setMyVouchers] = useState<VoucherDto[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [busyPassCode, setBusyPassCode] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [successMsg, setSuccessMsg] = useState<string | undefined>();

  async function loadData() {
    setLoading(true);
    setError(undefined);
    try {
      const [pkgs, vouchers, bal] = await Promise.all([
        voucherPassService.getCatalog(),
        voucherPassService.getMyVouchers(session.id),
        walletService.getBalance(session.id),
      ]);
      setPackages(pkgs);
      setMyVouchers(vouchers);
      setWalletBalance(bal.balance);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'voucher-pass'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  async function handlePurchase(pkg: PassPackageDefinition) {
    setError(undefined);
    setSuccessMsg(undefined);
    if (walletBalance < pkg.price) {
      setError(`Số dư ví chính (${formatVnd(walletBalance)}) không đủ để mua gói ${pkg.name} (${formatVnd(pkg.price)}). Nạp thêm tiền rồi thử lại.`);
      return;
    }

    setBusyPassCode(pkg.code);
    try {
      const res = await voucherPassService.purchasePass(session.id, pkg.code);
      setSuccessMsg(`Mua thành công gói ${res.passName}! Đã nhận ${res.vouchers.length} voucher mới.`);
      await loadData();
      setTab('my-vouchers');
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'voucher-pass'));
    } finally {
      setBusyPassCode(null);
    }
  }

  const availableVouchersCount = myVouchers.filter((v) => v.status === 'AVAILABLE').length;

  return (
    <Screen title="Gói Voucher Hội Viên" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 0,
          color: 'var(--el-muted)',
          fontSize: 13,
          padding: 0,
          marginBottom: 16,
          cursor: 'pointer',
        }}
      >
        ← Quay lại
      </button>

      {/* Top Disclaimer Banner */}
      <div
        style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12,
          color: '#d46b08',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <Icon name="info" size={16} style={{ color: '#d46b08', flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>Lưu ý học tập:</strong> Gói Voucher Pass và voucher giảm giá là tính năng mô phỏng trong Ewallet Lab (lấy cảm hứng từ Shopee Siêu Voucher / MoMo Student Pass). Không có đối tác hay thương hiệu thật đứng sau.
        </span>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => {
            setTab('catalog');
            setError(undefined);
            setSuccessMsg(undefined);
          }}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--el-line)',
            background: tab === 'catalog' ? 'var(--el-accent)' : 'var(--el-surface)',
            color: tab === 'catalog' ? '#fff' : 'var(--el-ink)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Mua Gói Pass
        </button>
        <button
          onClick={() => {
            setTab('my-vouchers');
            setError(undefined);
            setSuccessMsg(undefined);
          }}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid var(--el-line)',
            background: tab === 'my-vouchers' ? 'var(--el-accent)' : 'var(--el-surface)',
            color: tab === 'my-vouchers' ? '#fff' : 'var(--el-ink)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Voucher của tôi ({availableVouchersCount})
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5 }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <ProgressBar label="Đang tải dữ liệu…" />
      ) : tab === 'catalog' ? (
        <div>
          <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 12 }}>
            Số dư ví chính khả dụng: <strong>{formatVnd(walletBalance)}</strong>
          </div>

          {packages.map((pkg) => (
            <Card key={pkg.code} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--el-ink)' }}>
                    {pkg.name}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{pkg.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--el-accent-ink)' }}>
                    {formatVnd(pkg.price)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--el-faint)' }}>Hạn dùng {pkg.validDays} ngày</div>
                </div>
              </div>

              {/* Package Voucher List */}
              <div style={{ background: 'var(--el-surface-2)', borderRadius: 10, padding: '10px 12px', margin: '12px 0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--el-faint)', marginBottom: 6 }}>
                  ƯU ĐÃI BAO GỒM ({pkg.voucherTemplates.length} VOUCHER):
                </div>
                {pkg.voucherTemplates.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12.5 }}>
                    <Icon name="check_circle" size={16} style={{ color: 'var(--el-accent)' }} />
                    <span style={{ fontWeight: 600 }}>{t.title}</span>
                    <span style={{ color: 'var(--el-faint)', fontSize: 11.5 }}>
                      (Đơn tối thiểu {formatVnd(t.minOrderAmount)})
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handlePurchase(pkg)}
                disabled={busyPassCode !== null}
                style={{ width: '100%' }}
              >
                {busyPassCode === pkg.code ? 'Đang thanh toán…' : `Mua gói chỉ ${formatVnd(pkg.price)}`}
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          {myVouchers.length === 0 ? (
            <Card>
              <EmptyState
                icon="sell"
                text="Bạn chưa có voucher nào. Hãy khám phá và mua gói Voucher Pass để nhận bộ ưu đãi giảm giá hoá đơn!"
              />
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Button onClick={() => setTab('catalog')}>Xem các gói Pass</Button>
              </div>
            </Card>
          ) : (
            <div>
              {onGoToBillPayment && (
                <div style={{ marginBottom: 12, textAlign: 'right' }}>
                  <Button variant="ghost" onClick={onGoToBillPayment} style={{ fontSize: 12 }}>
                    Thanh toán hoá đơn để dùng voucher ›
                  </Button>
                </div>
              )}

              {myVouchers.map((v) => (
                <Card key={v.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: v.status === 'AVAILABLE' ? 'var(--el-accent-soft)' : 'var(--el-surface-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon
                          name="confirmation_number"
                          size={20}
                          style={{ color: v.status === 'AVAILABLE' ? 'var(--el-accent-ink)' : 'var(--el-faint)' }}
                        />
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{v.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>Mã: {v.code}</div>
                      </div>
                    </div>
                    <StatusPill status={v.status} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8, color: 'var(--el-muted)' }}>
                    <div>Đơn tối thiểu: <strong>{formatVnd(v.minOrderAmount)}</strong></div>
                    <div>Hạn dùng: <strong>{v.expiresAt.slice(0, 10)}</strong></div>
                  </div>

                  {v.description && (
                    <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginTop: 4 }}>
                      {v.description}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </Screen>
  );
}

