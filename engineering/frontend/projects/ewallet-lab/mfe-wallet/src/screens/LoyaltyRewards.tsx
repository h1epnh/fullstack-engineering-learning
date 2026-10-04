import { ApiError, type Loyalty, loyaltyService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Icon, ProgressBar, Screen, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #19 — "Điểm thưởng". A mock, in-house loyalty program (loyalty-service): points from bill
 * payments, tiers by rolling 12-month bill spend, points redeemed as cashback into the main wallet.
 * Generic naming on purpose — no third-party program/brand names, no partner voucher catalog.
 */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function TierCard({ data }: { data: Loyalty }) {
  const progress =
    data.nextTierMinSpend && data.nextTierMinSpend > 0 ? Math.min(100, (data.qualifyingSpend / data.nextTierMinSpend) * 100) : 100;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--el-faint)' }}>Điểm hiện có</div>
          <div style={{ fontFamily: 'var(--el-font-display)', fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {data.pointsBalance.toLocaleString('vi-VN')} điểm
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>≈ {formatVnd(data.pointsValueVnd)} hoàn tiền</div>
        </div>
        <span
          style={{
            background: 'var(--el-accent-soft)',
            color: 'var(--el-accent-ink)',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 12.5,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          Hạng {data.tier}
        </span>
      </div>
      <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--el-muted)' }}>
        Chi tiêu hoá đơn {data.tierWindowMonths} tháng gần nhất: <strong>{formatVnd(data.qualifyingSpend)}</strong>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--el-line)', overflow: 'hidden', margin: '8px 0 6px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--el-accent)' }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--el-faint)' }}>
        {data.nextTier && data.nextTierMinSpend !== null
          ? `Còn ${formatVnd(Math.max(0, data.nextTierMinSpend - data.qualifyingSpend))} để lên hạng ${data.nextTier}`
          : 'Bạn đang ở hạng cao nhất'}
      </div>
    </Card>
  );
}

/** Exposed as `./LoyaltyRewards` (see vite.config.ts). */
export default function LoyaltyRewards({ session, onBack }: { session: Session; onBack: () => void }) {
  const [data, setData] = useState<Loyalty | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [points, setPoints] = useState('');
  const [redeemError, setRedeemError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    loyaltyService
      .get(session.id)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setLoadError(describeApiError(e instanceof ApiError ? e.status : undefined, 'loyalty-redeem')));
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  async function handleRedeem() {
    if (!data) return;
    const n = Number(points);
    setNotice(undefined);
    if (!Number.isInteger(n) || n < data.minRedeemPoints) {
      setRedeemError(`Nhập số điểm nguyên, tối thiểu ${data.minRedeemPoints} điểm.`);
      return;
    }
    if (n > data.pointsBalance) {
      setRedeemError(`Bạn chỉ có ${data.pointsBalance.toLocaleString('vi-VN')} điểm.`);
      return;
    }
    setRedeemError(undefined);
    setBusy(true);
    try {
      setData(await loyaltyService.redeem(session.id, n));
      setPoints('');
      setNotice(`Đã đổi ${n.toLocaleString('vi-VN')} điểm — cộng ${formatVnd(n * data.pointValueVnd)} vào ví chính.`);
    } catch (e) {
      setRedeemError(describeApiError(e instanceof ApiError ? e.status : undefined, 'loyalty-redeem'));
      loyaltyService.get(session.id).then(setData).catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  const preview = data && Number.isInteger(Number(points)) && Number(points) > 0 ? Number(points) * data.pointValueVnd : 0;

  return (
    <Screen title="Điểm thưởng" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      {loadError && <p style={{ color: 'var(--el-danger)', fontSize: 13, fontWeight: 600 }}>{loadError}</p>}
      {!data && !loadError && <ProgressBar label="Đang cập nhật điểm thưởng…" />}

      {data && (
        <>
          {!data.synced && (
            <p role="status" style={{ fontSize: 12.5, color: 'var(--el-amber)', fontWeight: 600, margin: '0 0 12px' }}>
              Chưa đồng bộ được giao dịch mới — đang hiển thị số điểm đã lưu gần nhất.
            </p>
          )}
          <TierCard data={data} />

          {notice && (
            <p role="status" style={{ fontSize: 13, color: 'var(--el-accent-ink)', fontWeight: 600, margin: '12px 0 0' }}>
              {notice}
            </p>
          )}

          <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
            Đổi điểm lấy hoàn tiền
          </h2>
          <Card>
            <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 12px' }}>
              1 điểm = {formatVnd(data.pointValueVnd)}, cộng thẳng vào ví chính. Tối thiểu {data.minRedeemPoints} điểm mỗi lần.
            </p>
            <TextField
              id="loyalty-points"
              label="Số điểm muốn đổi"
              inputMode="numeric"
              value={points}
              onChange={(e) => setPoints(e.target.value.replace(/\D/g, ''))}
              error={redeemError}
            />
            {preview > 0 && (
              <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '-8px 0 12px' }}>Nhận về: {formatVnd(preview)}</p>
            )}
            <Button disabled={busy || data.pointsBalance < data.minRedeemPoints} onClick={handleRedeem}>
              {busy ? 'Đang cộng tiền vào ví…' : 'Đổi điểm'}
            </Button>
          </Card>

          <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
            Cách tích điểm & hạng thành viên
          </h2>
          <Card>
            <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
              Mỗi {formatVnd(data.spendPerPoint)} thanh toán hoá đơn = 1 điểm × hệ số hạng. Chuyển tiền, nạp/rút tiền không tích
              điểm. Hạng xét theo tổng tiền thanh toán hoá đơn {data.tierWindowMonths} tháng gần nhất.
            </p>
            {data.tiers.map((t) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  padding: '5px 0',
                  fontWeight: t.name === data.tier ? 800 : 500,
                  color: t.name === data.tier ? 'var(--el-accent-ink)' : undefined,
                }}
              >
                <span>
                  {t.name} · từ {formatVnd(t.minSpend)}
                </span>
                <span>× {t.multiplier.toLocaleString('vi-VN')}</span>
              </div>
            ))}
          </Card>

          <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
            Lịch sử điểm
          </h2>
          <Card>
            {data.history.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: 0 }}>
                Chưa có điểm nào. Thanh toán hoá đơn để bắt đầu tích điểm (chỉ tính giao dịch từ {formatDateTime(data.enrolledAt)}).
              </p>
            )}
            {data.history.slice(0, 20).map((e) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--el-line)' }}>
                <Icon name={e.kind === 'EARN' ? 'add_circle' : 'redeem'} size={18} style={{ color: 'var(--el-accent)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {e.kind === 'EARN'
                      ? `Thanh toán hoá đơn ${formatVnd(e.amountVnd)}`
                      : `Đổi lấy ${formatVnd(e.amountVnd)} hoàn tiền${e.status === 'FAILED' ? ' (thất bại, đã hoàn điểm)' : e.status === 'PENDING' ? ' (đang xử lý)' : ''}`}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>
                    {formatDateTime(e.createdAt)}
                    {e.tier ? ` · hạng ${e.tier}` : ''}
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: e.kind === 'EARN' ? 'var(--el-accent-ink)' : 'var(--el-muted)',
                    textDecoration: e.status === 'FAILED' ? 'line-through' : undefined,
                  }}
                >
                  {e.kind === 'EARN' ? '+' : '−'}
                  {e.points.toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </Card>

          <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '12px 0 0', lineHeight: 1.5 }}>
            Chương trình điểm thưởng mô phỏng trong lab — không có đối tác, thương hiệu hay kho voucher thật nào đứng sau. Phần
            thưởng duy nhất là hoàn tiền vào ví chính.
          </p>
        </>
      )}
    </Screen>
  );
}
