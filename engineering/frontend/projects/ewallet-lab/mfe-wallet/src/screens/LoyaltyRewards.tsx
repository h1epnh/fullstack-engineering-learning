import {
  ApiError,
  type CheckInStatus,
  type Loyalty,
  type LoyaltyEntry,
  type Mission,
  loyaltyService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Icon, ProgressBar, Screen, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #19 — "Điểm thưởng". A mock, in-house loyalty program (loyalty-service): points from bill
 * payments, tiers by rolling 12-month bill spend, points redeemed as cashback into the main wallet.
 * Generic naming on purpose — no third-party program/brand names, no partner voucher catalog.
 */
/**
 * Issue #38 — `EARN` entries from check-in/mission-claim reuse the SAME `PointEntryKind.EARN` as
 * bill-payment earnings (backend decision, documented in DESIGN.md: avoids an enum CHECK-constraint
 * migration on the already-existing `point_entries` table), distinguished only by `tier` holding a
 * `CHECK_IN_DAY_N`/`MISSION_<code>` marker instead of a real tier name — this is the one place that
 * has to know about that encoding to render a sensible label instead of "Thanh toán hoá đơn 0đ".
 */
function describeEarnOrRedeem(e: LoyaltyEntry): string {
  if (e.kind === 'REDEEM') {
    return `Đổi lấy ${formatVnd(e.amountVnd)} hoàn tiền${e.status === 'FAILED' ? ' (thất bại, đã hoàn điểm)' : e.status === 'PENDING' ? ' (đang xử lý)' : ''}`;
  }
  if (e.tier?.startsWith('CHECK_IN_DAY_')) {
    return `Điểm danh ngày ${e.tier.replace('CHECK_IN_DAY_', '')} trong chuỗi`;
  }
  if (e.tier?.startsWith('MISSION_')) {
    return `Nhận điểm nhiệm vụ: ${e.tier.replace('MISSION_', '')}`;
  }
  return `Thanh toán hoá đơn ${formatVnd(e.amountVnd)}`;
}

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

/** Issue #38 — "Điểm danh 7 ngày". Chuỗi trực quan 7 ô, mốc thưởng ngày 3/ngày 7 đánh dấu riêng
 * (đúng số liệu ticket: 5 điểm cơ bản, +15 ngày 3, +50 ngày 7). Ô đang sáng (filled) là những ngày
 * ĐÃ đạt trong chuỗi hiện tại (`currentStreakDay` từ backend, đã tính sẵn streak dự kiến ngay cả
 * khi CHƯA điểm danh hôm nay — xem `CheckInStatusDto`'s javadoc). */
function CheckinStreakCard({
  status,
  onCheckIn,
  busy,
}: {
  status: CheckInStatus;
  onCheckIn: () => void;
  busy: boolean;
}) {
  const filledDays = status.checkedInToday ? status.currentStreakDay : status.currentStreakDay - 1;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: 0 }}>
          Điểm danh 7 ngày
        </h2>
        <Icon name="local_fire_department" size={18} style={{ color: 'var(--el-accent)' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
          const filled = day <= filledDays;
          const milestone = day === 3 || day === 7;
          return (
            <div
              key={day}
              style={{
                flex: 1,
                aspectRatio: '1',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: filled ? 'var(--el-accent)' : 'var(--el-surface-2)',
                color: filled ? '#fff0f6' : 'var(--el-faint)',
                border: milestone ? '2px solid var(--el-accent-ink)' : '1px solid transparent',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <span>{day}</span>
              {milestone && <span style={{ fontSize: 9 }}>{day === 3 ? '+15' : '+50'}</span>}
            </div>
          );
        })}
      </div>
      <Button onClick={onCheckIn} disabled={busy || status.checkedInToday} variant={status.checkedInToday ? 'ghost' : 'primary'}>
        {status.checkedInToday
          ? 'Đã điểm danh hôm nay'
          : busy
            ? 'Đang điểm danh…'
            : `Điểm danh ngay (+${status.currentStreakDay === 3 ? 20 : status.currentStreakDay === 7 ? 55 : 5} điểm)`}
      </Button>
    </Card>
  );
}

/** Issue #38 — "Nhiệm vụ hàng ngày". */
function MissionsCard({
  missions,
  onClaim,
  claimingCode,
}: {
  missions: Mission[];
  onClaim: (code: string) => void;
  claimingCode: string | null;
}) {
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '0 0 12px' }}>
        Nhiệm vụ kiếm điểm
      </h2>
      {missions.map((m, i) => (
        <div
          key={m.code}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: i === 0 ? 0 : 12,
            marginTop: i === 0 ? 0 : 12,
            borderTop: i === 0 ? undefined : '1px solid var(--el-line)',
          }}
        >
          <Icon
            name={m.status === 'CLAIMED' ? 'task_alt' : m.status === 'COMPLETED' ? 'check_circle' : 'radio_button_unchecked'}
            size={20}
            style={{ color: m.status === 'IN_PROGRESS' ? 'var(--el-faint)' : 'var(--el-accent)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
            <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>{m.description} · +{m.rewardPoints} điểm</div>
          </div>
          {m.status === 'COMPLETED' && (
            <Button
              variant="secondary"
              onClick={() => onClaim(m.code)}
              disabled={claimingCode === m.code}
              style={{ width: 'auto', padding: '8px 14px', fontSize: 12.5 }}
            >
              {claimingCode === m.code ? '…' : 'Nhận điểm'}
            </Button>
          )}
          {m.status === 'CLAIMED' && (
            <span style={{ fontSize: 12, color: 'var(--el-faint)', fontWeight: 700 }}>Đã nhận</span>
          )}
        </div>
      ))}
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
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null);
  const [checkInBusy, setCheckInBusy] = useState(false);
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [claimingCode, setClaimingCode] = useState<string | null>(null);

  function refreshEngagement() {
    loyaltyService.getCheckInStatus(session.id).then(setCheckInStatus);
    loyaltyService.getMissions(session.id).then(setMissions);
  }

  useEffect(() => {
    let cancelled = false;
    loyaltyService
      .get(session.id)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setLoadError(describeApiError(e instanceof ApiError ? e.status : undefined, 'loyalty-redeem')));
    refreshEngagement();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  async function handleCheckIn() {
    setCheckInBusy(true);
    try {
      const result = await loyaltyService.checkIn(session.id);
      setNotice(`Điểm danh thành công — nhận ${result.pointsAwarded} điểm (ngày ${result.streakDay} trong chuỗi).`);
      loyaltyService.getCheckInStatus(session.id).then(setCheckInStatus);
      loyaltyService.get(session.id).then(setData);
    } catch (e) {
      setNotice(describeApiError(e instanceof ApiError ? e.status : undefined, 'daily-checkin'));
    } finally {
      setCheckInBusy(false);
    }
  }

  async function handleClaimMission(code: string) {
    setClaimingCode(code);
    try {
      const result = await loyaltyService.claimMission(session.id, code);
      setNotice(`Đã nhận ${result.pointsAwarded} điểm nhiệm vụ.`);
      loyaltyService.getMissions(session.id).then(setMissions);
      loyaltyService.get(session.id).then(setData);
    } catch (e) {
      setNotice(describeApiError(e instanceof ApiError ? e.status : undefined, 'mission-claim'));
    } finally {
      setClaimingCode(null);
    }
  }

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

          {checkInStatus && (
            <div style={{ marginTop: 16 }}>
              <CheckinStreakCard status={checkInStatus} onCheckIn={handleCheckIn} busy={checkInBusy} />
            </div>
          )}

          {missions && missions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <MissionsCard missions={missions} onClaim={handleClaimMission} claimingCode={claimingCode} />
            </div>
          )}

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
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{describeEarnOrRedeem(e)}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>
                    {formatDateTime(e.createdAt)}
                    {e.tier && !e.tier.startsWith('CHECK_IN_DAY_') && !e.tier.startsWith('MISSION_') ? ` · hạng ${e.tier}` : ''}
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
