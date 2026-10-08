import { type BillLookupResponse, type VoucherDto, voucherPassService } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';
import { BILL_CATEGORIES } from '../categories';

export type AutoDebitOption = {
  enabled: boolean;
  maxCap: number;
};

export function BillConfirm({
  bill,
  userId,
  onBack,
  onConfirm,
}: {
  bill: BillLookupResponse;
  userId: string;
  onBack: () => void;
  onConfirm: (autoDebit?: AutoDebitOption, voucherId?: string) => Promise<string | null>;
}) {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [autoDebit, setAutoDebit] = useState(false);
  const [usableVouchers, setUsableVouchers] = useState<VoucherDto[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(true);

  // Default max cap rounded up to next 50,000đ above bill amount, or 1.5x
  const defaultCap = Math.max(
    Math.ceil((bill.amount * 1.5) / 50000) * 50000,
    bill.amount + 50000,
  );
  const [maxCapInput, setMaxCapInput] = useState(defaultCap.toString());
  const categoryLabel = BILL_CATEGORIES.find((c) => c.key === bill.category)?.label ?? bill.category;

  const numericMaxCap = parseInt(maxCapInput.replace(/\D/g, ''), 10) || defaultCap;

  useEffect(() => {
    let cancelled = false;
    async function loadVouchers() {
      try {
        setLoadingVouchers(true);
        const list = await voucherPassService.getUsableVouchers(userId, bill.category, bill.amount);
        if (!cancelled) {
          setUsableVouchers(list);
          if (list.length > 0) {
            // Auto-select first available voucher
            setSelectedVoucherId(list[0].id);
          }
        }
      } catch {
        // Loyalty service might be offline or empty, fallback gracefully
      } finally {
        if (!cancelled) {
          setLoadingVouchers(false);
        }
      }
    }
    loadVouchers();
    return () => {
      cancelled = true;
    };
  }, [userId, bill.category, bill.amount]);

  const selectedVoucher = usableVouchers.find((v) => v.id === selectedVoucherId);
  // Voucher.java (loyalty-service) chỉ có một kiểu giảm giá: số tiền cố định (discountAmount),
  // không có percentage/maxDiscountAmount — không suy đoán field backend chưa có.
  const discountAmount = selectedVoucher ? Math.min(bill.amount, selectedVoucher.discountAmount) : 0;
  const finalAmount = Math.max(0, bill.amount - discountAmount);

  async function submit() {
    setLoading(true);
    const err = await onConfirm(
      autoDebit ? { enabled: true, maxCap: numericMaxCap } : undefined,
      selectedVoucherId || undefined,
    );
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
        <Row label="Số tiền hoá đơn" value={formatVnd(bill.amount)} />
        {discountAmount > 0 && (
          <Row label="Giảm giá voucher" value={`-${formatVnd(discountAmount)}`} highlight />
        )}
        <Row label="Tổng thanh toán" value={formatVnd(finalAmount)} strong />
      </Card>

      {/* Issue #28: Chọn Voucher Pass */}
      <div
        style={{
          marginTop: 14,
          background: 'var(--el-surface)',
          border: '1.5px solid var(--el-line)',
          borderRadius: 14,
          padding: '14px 16px',
          boxShadow: 'var(--el-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="sell" size={18} style={{ color: 'var(--el-accent)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--el-ink)' }}>Ưu đãi Voucher Pass</span>
          </div>
          {selectedVoucher && discountAmount > 0 && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--el-accent)',
                background: 'var(--el-accent-soft)',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              Tiết kiệm {formatVnd(discountAmount)}
            </span>
          )}
        </div>

        {loadingVouchers ? (
          <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>Đang tìm voucher khả dụng…</div>
        ) : usableVouchers.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--el-muted)', lineHeight: 1.45 }}>
            Không có voucher phù hợp với hoá đơn này. (Bạn có thể mua Gói Voucher Hội Viên tại Trang chủ để nhận ưu đãi)
          </div>
        ) : (
          <div>
            <select
              value={selectedVoucherId ?? ''}
              onChange={(e) => setSelectedVoucherId(e.target.value ? e.target.value : null)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid var(--el-line)',
                background: 'var(--el-surface-2)',
                color: 'var(--el-ink)',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Không áp dụng voucher</option>
              {usableVouchers.map((v) => {
                const discountDesc = `Giảm ${formatVnd(v.discountAmount)}`;
                return (
                  <option key={v.id} value={v.id}>
                    {v.title} — {discountDesc}
                  </option>
                );
              })}
            </select>
            {selectedVoucher && (
              <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginTop: 6 }}>
                Hạn sử dụng: {new Date(selectedVoucher.expiresAt).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Issue #26: Toggle đăng ký thanh toán tự động (Auto-debit) */}
      <div
        style={{
          marginTop: 14,
          background: autoDebit ? 'var(--el-surface-2)' : 'var(--el-surface)',
          border: `1.5px solid ${autoDebit ? 'var(--el-accent)' : 'var(--el-line)'}`,
          borderRadius: 14,
          padding: '14px 16px',
          boxShadow: 'var(--el-shadow)',
          transition: 'all 0.2s ease',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={autoDebit}
            onChange={(e) => setAutoDebit(e.target.checked)}
            style={{
              marginTop: 3,
              width: 18,
              height: 18,
              accentColor: 'var(--el-accent)',
              cursor: 'pointer',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--el-ink)' }}>
                Tự động thanh toán kỳ sau (Auto-debit)
              </span>
              <span
                style={{
                  background: 'var(--el-accent-soft)',
                  color: 'var(--el-accent-ink)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 6,
                }}
              >
                Tiện ích
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
              Tự động thanh toán ngay khi có hoá đơn mới, không lo trễ hạn hay gián đoạn dịch vụ.
            </p>
          </div>
        </label>

        {autoDebit && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px dashed var(--el-line)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div>
              <TextField
                id="maxCap"
                label="Hạn mức thanh toán tối đa mỗi kỳ (Max cap)"
                placeholder="VD: 500000"
                value={maxCapInput}
                onChange={(e) => setMaxCapInput(e.target.value)}
                hint={`Nếu hoá đơn kỳ tới vượt quá ${formatVnd(numericMaxCap)}, hệ thống sẽ KHÔNG tự động trừ tiền mà gửi thông báo để bạn duyệt.`}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--el-surface)',
                borderRadius: 8,
                border: '1px solid var(--el-line)',
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--el-muted)' }}>Nguồn tiền trích nợ:</span>
              <strong style={{ color: 'var(--el-ink)' }}>Ví chính</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--el-surface)',
                borderRadius: 8,
                border: '1px solid var(--el-line)',
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--el-muted)' }}>Thời gian quét cước:</span>
              <strong style={{ color: 'var(--el-ink)' }}>Định kỳ hàng tháng khi có hoá đơn</strong>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '16px 0 0' }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button onClick={submit} disabled={loading}>
          {loading
            ? 'Đang thanh toán…'
            : autoDebit
              ? `Thanh toán & Bật Auto-debit (${formatVnd(finalAmount)})`
              : `Xác nhận thanh toán ${formatVnd(finalAmount)}`}
        </Button>
      </div>
    </Screen>
  );
}

function Row({ label, value, strong, highlight }: { label: string; value: string; strong?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--el-line)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>{label}</span>
      <span style={{ fontSize: strong ? 15 : 12.5, fontWeight: strong ? 800 : 600, color: highlight ? 'var(--el-accent)' : undefined }}>
        {value}
      </span>
    </div>
  );
}
