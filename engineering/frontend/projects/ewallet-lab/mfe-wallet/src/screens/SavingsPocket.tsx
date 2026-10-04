import { ApiError, savingsPocketService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Screen, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #13 — "Túi Thần Tài". Wires `Home.tsx`'s previously-static MiniWallet tile to a real screen.
 * Served by wallet-service directly (savings-pocket lives in the same DB/service as the main
 * wallet, operator's architecture decision — see backend DESIGN.md), so there is no cross-service
 * network hop for open/deposit/withdraw and no step-up gate: money never leaves the user's own
 * total balance, it only moves between two ledgers of the SAME service in one local transaction.
 */
type Mode = 'deposit' | 'withdraw';

export default function SavingsPocket({ session, onBack }: { session: Session; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [balance, setBalance] = useState(0);
  const [annualRate, setAnnualRate] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<Mode>('deposit');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await savingsPocketService.view(session.id);
    setOpened(res.opened);
    setBalance(res.balance);
    setAnnualRate(res.annualRate);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  async function handleOpen() {
    setError(undefined);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Nhập số tiền hợp lệ.');
      return;
    }
    setBusy(true);
    try {
      const res = await savingsPocketService.open(session.id, value);
      setOpened(res.opened);
      setBalance(res.balance);
      setAnnualRate(res.annualRate);
      setAmount('');
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'savings-pocket'));
    } finally {
      setBusy(false);
    }
  }

  async function handleMove() {
    setError(undefined);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Nhập số tiền hợp lệ.');
      return;
    }
    setBusy(true);
    try {
      const res =
        mode === 'deposit'
          ? await savingsPocketService.deposit(session.id, value)
          : await savingsPocketService.withdraw(session.id, value);
      setBalance(res.balance);
      setAnnualRate(res.annualRate);
      setAmount('');
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'savings-pocket'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Túi Thần Tài" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>
      ) : !opened ? (
        <Card>
          <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 10px' }}>
            Túi Thần Tài là một khoản riêng, tách khỏi ví chính, sinh lãi mỗi ngày (mô phỏng — xem ghi chú bên
            dưới). Rút về ví chính bất kỳ lúc nào, không mất lãi đã tích luỹ.
          </p>
          <TextField
            id="open-amount"
            label="Số tiền mở lần đầu (tối thiểu 10.000đ)"
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error}
          />
          <Button onClick={handleOpen} disabled={busy}>
            {busy ? 'Đang mở…' : 'Mở Túi Thần Tài'}
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 4 }}>Số dư Túi Thần Tài</div>
            <div
              style={{
                fontFamily: 'var(--el-font-display)',
                fontSize: 26,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                marginBottom: 6,
              }}
            >
              {formatVnd(balance)}
            </div>
            {annualRate != null && (
              <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>
                Lãi suất mô phỏng {(annualRate * 100).toFixed(0)}%/năm, cộng dồn hàng ngày
              </div>
            )}
          </Card>

          <Card>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Button variant={mode === 'deposit' ? 'primary' : 'secondary'} onClick={() => setMode('deposit')}>
                Nạp thêm
              </Button>
              <Button variant={mode === 'withdraw' ? 'primary' : 'secondary'} onClick={() => setMode('withdraw')}>
                Rút về ví chính
              </Button>
            </div>
            <TextField
              id="move-amount"
              label={mode === 'deposit' ? 'Số tiền nạp từ ví chính' : 'Số tiền rút về ví chính'}
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={error}
            />
            <Button onClick={handleMove} disabled={busy}>
              {busy ? 'Đang xử lý…' : mode === 'deposit' ? 'Nạp vào Túi Thần Tài' : 'Rút về ví chính'}
            </Button>
          </Card>

          <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '4px 2px' }}>
            Lãi suất trên là MÔ PHỎNG cho mục đích học tập — không có quỹ đầu tư/ngân hàng lưu ký thật đứng sau,
            khác thực tế MoMo/ZaloPay có đối tác quỹ/ngân hàng thật.
          </p>
        </>
      )}
    </Screen>
  );
}
