import { ApiError, BNPL_MIN_DRAW, type BnplStatement, type BnplWallet, bnplService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Icon, ProgressBar, Screen, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Issue #18 — "Ví Trả Sau" (mock BNPL credit line, bnpl-service). Every number shown comes from
 * momo.vn/vi-tra-sau (fetched directly, see backend DESIGN.md "Ví Trả Sau"), but this is a
 * LEARNING SIMULATION: not a real lending product, no real bank/finance company behind it.
 *
 * The disclaimer is deliberately not small print (issue #18 Constraints):
 * - DISCLAIMER_POINTS is shown in a blocking modal that must be acknowledged before the first open
 *   (and the backend also refuses to open without `acceptedDisclaimer: true`).
 * - DISCLAIMER_BANNER sits at the top of every state of this screen.
 */
export const DISCLAIMER_POINTS = [
  'Đây là MÔ PHỎNG HỌC TẬP trong Ewallet Lab.',
  'Đây KHÔNG PHẢI sản phẩm cho vay hay tín dụng tiêu dùng thật — không có khoản vay, hạn mức hay nghĩa vụ nợ thật nào được tạo ra.',
  'KHÔNG CÓ ngân hàng hay công ty tài chính thật nào đứng sau Ví Trả Sau của lab này. Hạn mức, lãi và phí chỉ lấy từ thông tin công khai của MoMo để học; lab không kết nối với bất kỳ tổ chức tín dụng nào.',
];

export const DISCLAIMER_BANNER =
  'Mô phỏng học tập — KHÔNG PHẢI sản phẩm cho vay thật, KHÔNG CÓ ngân hàng/công ty tài chính thật nào đứng sau.';

function errorOf(e: unknown, context: 'bnpl-open' | 'bnpl-draw' | 'bnpl-repay'): string {
  return describeApiError(e instanceof ApiError ? e.status : undefined, context);
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN');
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
}

function DisclaimerBanner() {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        background: 'var(--el-amber-soft)',
        color: 'var(--el-ink)',
        border: '2px solid var(--el-amber)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 16,
        fontSize: 13.5,
        fontWeight: 700,
        lineHeight: 1.45,
      }}
    >
      <Icon name="warning" />
      <span>{DISCLAIMER_BANNER}</span>
    </div>
  );
}

function DisclaimerModal({ busy, error, onConfirm, onCancel }: {
  busy: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bnpl-disclaimer-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          borderRadius: 16,
          padding: 20,
          maxWidth: 440,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--el-shadow)',
        }}
      >
        <h2
          id="bnpl-disclaimer-title"
          style={{ fontFamily: 'var(--el-font-display)', fontSize: 18, fontWeight: 800, margin: '0 0 12px' }}
        >
          Đọc kỹ trước khi mở Ví Trả Sau
        </h2>
        <ol style={{ margin: '0 0 16px', paddingLeft: 20, fontSize: 14, lineHeight: 1.55 }}>
          {DISCLAIMER_POINTS.map((p) => (
            <li key={p} style={{ marginBottom: 8 }}>
              {p}
            </li>
          ))}
        </ol>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ marginTop: 3 }} />
          Tôi đã đọc và hiểu đây chỉ là mô phỏng học tập, không phải sản phẩm cho vay thật.
        </label>
        {error && <p style={{ color: 'var(--el-danger)', fontSize: 13, fontWeight: 600, margin: '0 0 12px' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button disabled={!checked || busy} onClick={onConfirm}>
            {busy ? 'Đang mở…' : 'Xác nhận và mở Ví Trả Sau'}
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onCancel}>
            Huỷ
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13.5, padding: '4px 0' }}>
      <span style={{ color: 'var(--el-muted)' }}>{label}</span>
      <span style={{ fontWeight: strong ? 800 : 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
      {children}
    </h2>
  );
}

const STATUS_LABEL: Record<BnplStatement['status'], string> = {
  NOT_DUE: 'Chưa đến hạn',
  OVERDUE: 'Quá hạn',
  SETTLED: 'Đã thanh toán',
};

function StatementCard({ s }: { s: BnplStatement }) {
  const [year, month] = s.period.split('-');
  const unpaidPrincipal = s.principal - s.principalPaid;
  const unpaidFee = s.serviceFee - s.serviceFeePaid;
  return (
    <div style={{ marginBottom: 10 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <strong style={{ fontSize: 14 }}>
            Kỳ tháng {Number(month)}/{year}
          </strong>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: s.status === 'OVERDUE' ? 'var(--el-danger)' : s.status === 'SETTLED' ? 'var(--el-muted)' : 'var(--el-amber)',
            }}
          >
            {STATUS_LABEL[s.status]}
            {s.status === 'OVERDUE' ? ` · trễ ${s.daysLate} ngày` : ''}
          </span>
        </div>
        <Row label="Hạn thanh toán" value={formatDate(s.dueDate)} />
        <Row label="Mua sắm còn nợ" value={formatVnd(unpaidPrincipal)} />
        <Row label="Phí dịch vụ tháng còn nợ" value={formatVnd(unpaidFee)} />
        {(s.lateFeeDue > 0 || s.lateFeePaid > 0) && (
          <Row
            label={`Phí trễ hạn (${formatPercent(s.lateFeeRate)} dư nợ)`}
            value={`${formatVnd(s.lateFeeDue)}${s.lateFeePaid > 0 ? ` (đã trả ${formatVnd(s.lateFeePaid)})` : ''}`}
          />
        )}
        <Row label="Cần trả kỳ này" value={formatVnd(s.totalDue)} strong />
      </Card>
    </div>
  );
}

function NotOpened({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <Card>
        <p style={{ fontSize: 14, margin: '0 0 10px', lineHeight: 1.5 }}>
          Mô phỏng ví “mua trước, trả sau”: dùng hạn mức để mua sắm (giả lập) trong tháng, rồi trả lại bằng tiền từ ví
          chính vào đầu tháng tiếp theo.
        </p>
        <Row label="Hạn mức (cố định cho mọi người dùng lab)" value={formatVnd(20_000_000)} />
        <Row label="Lãi nếu trả đúng hạn" value="0%" />
        <Row label="Phí dịch vụ" value="33.000đ/tháng có phát sinh giao dịch" />
        <Row label="Hạn thanh toán" value="Ngày 1 của tháng tiếp theo" />
        <Row label="Phí trễ hạn trên dư nợ" value="5,25% / 10,5% / 15,75% / 21%" />
        <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '8px 0 0' }}>
          Phí trễ hạn theo số ngày trễ: 1–4 ngày, 5–9 ngày, 10–14 ngày, từ 15 ngày trở lên. Không có thẩm định tín dụng —
          duyệt ngay vì đây là mô phỏng.
        </p>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Button onClick={onOpen}>Mở Ví Trả Sau (mô phỏng)</Button>
      </div>
    </>
  );
}

function Opened({ wallet, session, onChange }: { wallet: BnplWallet; session: Session; onChange: (w: BnplWallet) => void }) {
  const [drawAmount, setDrawAmount] = useState('');
  const [drawLabel, setDrawLabel] = useState('Mua sắm');
  const [drawError, setDrawError] = useState<string | undefined>();
  const [repayAmount, setRepayAmount] = useState('');
  const [repayError, setRepayError] = useState<string | undefined>();
  const [busy, setBusy] = useState<'draw' | 'repay' | null>(null);
  const [notice, setNotice] = useState<string | undefined>();

  const totalDue = wallet.totalDue ?? 0;

  async function handleDraw() {
    const amount = Number(drawAmount);
    setNotice(undefined);
    if (!Number.isInteger(amount) || amount < BNPL_MIN_DRAW) {
      setDrawError(`Nhập số tiền nguyên, tối thiểu ${formatVnd(BNPL_MIN_DRAW)}.`);
      return;
    }
    if (amount > (wallet.availableLimit ?? 0)) {
      setDrawError(`Vượt hạn mức khả dụng (còn ${formatVnd(wallet.availableLimit ?? 0)}).`);
      return;
    }
    setDrawError(undefined);
    setBusy('draw');
    try {
      onChange(await bnplService.draw(session.id, amount, drawLabel));
      setDrawAmount('');
      setNotice(`Đã ghi nhận khoản mua sắm trả sau ${formatVnd(amount)} (mô phỏng).`);
    } catch (e) {
      setDrawError(errorOf(e, 'bnpl-draw'));
    } finally {
      setBusy(null);
    }
  }

  async function handleRepay() {
    const amount = Number(repayAmount);
    setNotice(undefined);
    if (!Number.isInteger(amount) || amount < 1) {
      setRepayError('Nhập số tiền nguyên dương.');
      return;
    }
    if (amount > totalDue) {
      setRepayError(`Vượt quá tổng dư nợ hiện tại (${formatVnd(totalDue)}).`);
      return;
    }
    setRepayError(undefined);
    setBusy('repay');
    try {
      onChange(await bnplService.repay(session.id, amount));
      setRepayAmount('');
      setNotice(`Đã trả ${formatVnd(amount)} từ ví chính.`);
    } catch (e) {
      setRepayError(errorOf(e, 'bnpl-repay'));
      // A failed debit still leaves a FAILED repayment row server-side — refresh so it shows up.
      bnplService.get(session.id).then(onChange).catch(() => undefined);
    } finally {
      setBusy(null);
    }
  }

  const unsettled = wallet.statements.filter((s) => s.status !== 'SETTLED');
  const settled = wallet.statements.filter((s) => s.status === 'SETTLED');

  return (
    <>
      <Card>
        <div style={{ fontSize: 12, color: 'var(--el-faint)' }}>Hạn mức khả dụng</div>
        <div style={{ fontFamily: 'var(--el-font-display)', fontSize: 24, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {formatVnd(wallet.availableLimit ?? 0)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 10 }}>
          trên tổng hạn mức {formatVnd(wallet.creditLimit ?? 0)}
        </div>
        <Row label="Tổng dư nợ cần trả" value={formatVnd(totalDue)} strong />
        <Row
          label="Hạn thanh toán gần nhất"
          value={
            wallet.nextDueDate ? (
              <span style={{ color: wallet.overdue ? 'var(--el-danger)' : undefined }}>
                {formatDate(wallet.nextDueDate)}
                {wallet.overdue ? ' · QUÁ HẠN' : ''}
              </span>
            ) : (
              '—'
            )
          }
        />
      </Card>

      {notice && (
        <p role="status" style={{ fontSize: 13, color: 'var(--el-accent-ink)', fontWeight: 600, margin: '12px 0 0' }}>
          {notice}
        </p>
      )}

      <SectionTitle>Mua sắm trả sau (mô phỏng)</SectionTitle>
      <Card>
        <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '0 0 12px' }}>
          Không có cửa hàng thật — chỉ giả lập một giao dịch phát sinh trong tháng để giảm hạn mức và tăng dư nợ. Giao dịch
          đầu tiên trong tháng sẽ cộng phí dịch vụ 33.000đ vào kỳ đó.
        </p>
        <TextField
          id="bnpl-draw-amount"
          label="Số tiền"
          inputMode="numeric"
          value={drawAmount}
          onChange={(e) => setDrawAmount(e.target.value.replace(/\D/g, ''))}
          error={drawError}
        />
        <TextField id="bnpl-draw-label" label="Nội dung" value={drawLabel} maxLength={100} onChange={(e) => setDrawLabel(e.target.value)} />
        <Button disabled={busy !== null} onClick={handleDraw}>
          {busy === 'draw' ? 'Đang xử lý…' : 'Mua sắm trả sau'}
        </Button>
      </Card>

      <SectionTitle>Trả nợ từ ví chính</SectionTitle>
      <Card>
        <TextField
          id="bnpl-repay-amount"
          label="Số tiền trả"
          inputMode="numeric"
          value={repayAmount}
          onChange={(e) => setRepayAmount(e.target.value.replace(/\D/g, ''))}
          error={repayError}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="secondary" disabled={busy !== null || totalDue === 0} onClick={() => setRepayAmount(String(totalDue))}>
            Điền toàn bộ dư nợ ({formatVnd(totalDue)})
          </Button>
          <Button disabled={busy !== null || totalDue === 0} onClick={handleRepay}>
            {busy === 'repay' ? 'Đang trừ tiền ví chính…' : 'Trả nợ'}
          </Button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '10px 0 0' }}>
          Trả kỳ cũ nhất trước; trong mỗi kỳ trả phí trễ hạn trước, rồi phí dịch vụ, rồi tiền mua sắm.
        </p>
      </Card>

      <SectionTitle>Sao kê</SectionTitle>
      {unsettled.length === 0 && settled.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Chưa có giao dịch trả sau nào.</p>
      )}
      {[...unsettled, ...settled].map((s) => (
        <StatementCard key={s.period} s={s} />
      ))}

      {wallet.draws.length > 0 && (
        <>
          <SectionTitle>Khoản mua sắm gần đây</SectionTitle>
          <Card>
            {wallet.draws.slice(0, 10).map((d) => (
              <Row key={d.id} label={`${d.label} · ${new Date(d.createdAt).toLocaleDateString('vi-VN')}`} value={formatVnd(d.amount)} />
            ))}
          </Card>
        </>
      )}

      {wallet.repayments.length > 0 && (
        <>
          <SectionTitle>Lịch sử trả nợ</SectionTitle>
          <Card>
            {wallet.repayments.slice(0, 10).map((r) => (
              <Row
                key={r.id}
                label={`${new Date(r.createdAt).toLocaleDateString('vi-VN')} · ${
                  r.status === 'COMPLETED' ? 'Thành công' : r.status === 'FAILED' ? 'Thất bại' : 'Đang xử lý'
                }`}
                value={formatVnd(r.amount)}
              />
            ))}
          </Card>
        </>
      )}
    </>
  );
}

/** Exposed as `./BnplWallet` (see vite.config.ts). */
export default function BnplWalletScreen({ session, onBack }: { session: Session; onBack: () => void }) {
  const [wallet, setWallet] = useState<BnplWallet | null>(null);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    bnplService
      .get(session.id)
      .then((w) => !cancelled && setWallet(w))
      .catch((e) => !cancelled && setLoadError(describeApiError(e instanceof ApiError ? e.status : undefined, 'bnpl-open')));
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  async function handleConfirmOpen() {
    setOpening(true);
    setOpenError(undefined);
    try {
      setWallet(await bnplService.open(session.id));
      setShowDisclaimer(false);
    } catch (e) {
      setOpenError(errorOf(e, 'bnpl-open'));
    } finally {
      setOpening(false);
    }
  }

  return (
    <Screen title="Ví Trả Sau" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <DisclaimerBanner />

      {loadError && <p style={{ color: 'var(--el-danger)', fontSize: 13, fontWeight: 600 }}>{loadError}</p>}
      {!wallet && !loadError && <ProgressBar label="Đang tải Ví Trả Sau…" />}
      {wallet && !wallet.opened && <NotOpened onOpen={() => setShowDisclaimer(true)} />}
      {wallet && wallet.opened && <Opened wallet={wallet} session={session} onChange={setWallet} />}

      {showDisclaimer && (
        <DisclaimerModal
          busy={opening}
          error={openError}
          onConfirm={handleConfirmOpen}
          onCancel={() => {
            setShowDisclaimer(false);
            setOpenError(undefined);
          }}
        />
      )}
    </Screen>
  );
}
