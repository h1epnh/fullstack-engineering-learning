import {
  ApiError,
  STEP_UP_REQUIRED_STATUS,
  type SavingsGoalDetailDto,
  type SavingsGoalDto,
  savingsGoalService,
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
 * Issue #27 — Goal-based Savings / "Heo Tiết Kiệm cá nhân"
 * Cho phép phân bổ dòng tiền cá nhân theo từng mục tiêu cụ thể (mua sắm, du lịch, khẩn cấp...).
 * Tiền được hạch toán tách biệt với ví chính ngay trong wallet-service (Architecture Option a).
 * Đảm bảo:
 * - Hạn mức tháng TT 40/2024 & Step-up QĐ 2345 (> 10 triệu đồng khi nạp).
 * - Zero-loss concurrency check khi rút về ví chính.
 * - Disclaimer học tập bắt buộc.
 */

type ModalMode = 'none' | 'create' | 'deposit' | 'withdraw' | 'detail';

export default function SavingsGoals({
  session,
  onBack,
}: {
  session: Session;
  onBack: () => void;
}) {
  const [goals, setGoals] = useState<SavingsGoalDto[]>([]);
  const [mainBalance, setMainBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [modalMode, setModalMode] = useState<ModalMode>('none');
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalDto | null>(null);
  const [goalDetail, setGoalDetail] = useState<SavingsGoalDetailDto | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [busy, setBusy] = useState(false);

  // Step-up modal state
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [stepUpMessage, setStepUpMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  async function loadData() {
    setLoading(true);
    setError(undefined);
    try {
      const [goalsRes, balanceRes] = await Promise.all([
        savingsGoalService.getGoals(session.id),
        walletService.getBalance(session.id),
      ]);
      setGoals(goalsRes);
      setMainBalance(balanceRes.balance);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'savings-goal'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  function openCreateModal() {
    setFormName('');
    setFormTargetAmount('');
    // Default deadline: 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setFormTargetDate(d.toISOString().slice(0, 10));
    setError(undefined);
    setModalMode('create');
  }

  function openDepositModal(g: SavingsGoalDto) {
    setSelectedGoal(g);
    setFormAmount('');
    setError(undefined);
    setModalMode('deposit');
  }

  function openWithdrawModal(g: SavingsGoalDto) {
    setSelectedGoal(g);
    setFormAmount('');
    setError(undefined);
    setModalMode('withdraw');
  }

  async function openDetailModal(g: SavingsGoalDto) {
    setSelectedGoal(g);
    setGoalDetail(null);
    setModalMode('detail');
    try {
      const detail = await savingsGoalService.getGoalDetail(g.id);
      setGoalDetail(detail);
    } catch {
      // Fallback if detail fetch fails
    }
  }

  async function handleCreate() {
    setError(undefined);
    const target = Number(formTargetAmount);
    if (!formName.trim()) {
      setError('Vui lòng nhập tên mục tiêu.');
      return;
    }
    if (!target || target < 10000) {
      setError('Số tiền mục tiêu tối thiểu là 10.000đ.');
      return;
    }
    if (!formTargetDate) {
      setError('Vui lòng chọn ngày hoàn thành mục tiêu.');
      return;
    }

    setBusy(true);
    try {
      await savingsGoalService.createGoal({
        userId: session.id,
        name: formName.trim(),
        targetAmount: target,
        targetDate: formTargetDate,
      });
      setModalMode('none');
      await loadData();
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'savings-goal'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeposit(stepUpConfirmed = false) {
    if (!selectedGoal) return;
    setError(undefined);
    const amt = Number(formAmount);
    if (!amt || amt < 1000) {
      setError('Số tiền nạp tối thiểu là 1.000đ.');
      return;
    }
    if (amt > mainBalance) {
      setError('Số dư ví chính không đủ để nạp vào mục tiêu này.');
      return;
    }

    setBusy(true);
    try {
      await savingsGoalService.deposit(selectedGoal.id, {
        amount: amt,
        stepUpConfirmed,
      });
      setStepUpOpen(false);
      setModalMode('none');
      await loadData();
    } catch (e) {
      if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
        setStepUpMessage(
          'Giao dịch nạp mục tiêu tiết kiệm vượt 10.000.000đ hoặc ngưỡng ngày cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN.',
        );
        setPendingAction(() => () => handleDeposit(true));
        setStepUpOpen(true);
      } else {
        setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'savings-goal'));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleWithdraw() {
    if (!selectedGoal) return;
    setError(undefined);
    const amt = Number(formAmount);
    if (!amt || amt < 1000) {
      setError('Số tiền rút tối thiểu là 1.000đ.');
      return;
    }
    if (amt > selectedGoal.currentAmount) {
      setError('Số tiền rút vượt quá số dư hiện có trong mục tiêu.');
      return;
    }

    setBusy(true);
    try {
      await savingsGoalService.withdraw(selectedGoal.id, { amount: amt });
      setModalMode('none');
      await loadData();
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'savings-goal'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Heo Tiết Kiệm" withNavGutter={false}>
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

      {/* Top Banner Disclaimer */}
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
          <strong>Lưu ý học tập:</strong> Heo Tiết Kiệm (Mục tiêu tiết kiệm) là tính năng mô phỏng cho mục đích học tập. Tiền được quản trị nội bộ theo phương án mở rộng ví chính, không sinh lãi suất ngân hàng.
        </span>
      </div>

      {/* Summary Card */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 4 }}>Tổng tiền đang tiết kiệm</div>
            <div
              style={{
                fontFamily: 'var(--el-font-display)',
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--el-accent-ink)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatVnd(totalSaved)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--el-muted)', marginTop: 4 }}>
              Số dư ví chính khả dụng: {formatVnd(mainBalance)}
            </div>
          </div>
          <Button onClick={openCreateModal} style={{ padding: '8px 14px', fontSize: 12.5 }}>
            + Tạo mục tiêu
          </Button>
        </div>
      </Card>

      {/* Goals List */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '0 0 12px' }}>
          Mục tiêu của bạn ({goals.length})
        </h2>

        {loading ? (
          <ProgressBar label="Đang tải danh sách mục tiêu…" />
        ) : goals.length === 0 ? (
          <Card>
            <EmptyState
              icon="savings"
              text="Bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu đầu tiên (mua xe, du lịch, quỹ dự phòng...) để tích luỹ mỗi ngày!"
            />
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Button onClick={openCreateModal}>Tạo mục tiêu ngay</Button>
            </div>
          </Card>
        ) : (
          goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.status === 'COMPLETED' || goal.currentAmount >= goal.targetAmount;
            return (
              <Card key={goal.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'var(--el-accent-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="savings" size={20} style={{ color: 'var(--el-accent-ink)' }} />
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{goal.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>
                        Hạn chót: {goal.targetDate ? goal.targetDate.slice(0, 10) : 'Không giới hạn'}
                      </div>
                    </div>
                  </div>
                  <StatusPill status={isCompleted ? 'COMPLETED' : goal.status} />
                </div>

                {/* Progress bar */}
                <div style={{ margin: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--el-accent-ink)' }}>
                      {formatVnd(goal.currentAmount)}
                    </span>
                    <span style={{ color: 'var(--el-faint)' }}>{formatVnd(goal.targetAmount)} ({pct}%)</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      background: 'var(--el-surface-2)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isCompleted ? 'var(--el-accent-ink)' : 'var(--el-accent)',
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button
                    variant="primary"
                    onClick={() => openDepositModal(goal)}
                    style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
                  >
                    Nạp thêm
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => openWithdrawModal(goal)}
                    disabled={goal.currentAmount <= 0}
                    style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
                  >
                    Rút về ví
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => openDetailModal(goal)}
                    style={{ padding: '7px 10px', fontSize: 12 }}
                  >
                    Lịch sử
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal: Tạo mục tiêu mới */}
      {modalMode === 'create' && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 10, 20, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 900,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--el-surface)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Tạo Mục Tiêu Tiết Kiệm</h3>
            <TextField
              id="goal-name"
              label="Tên mục tiêu"
              placeholder="VD: Mua điện thoại mới, Du lịch..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <TextField
              id="goal-target"
              label="Số tiền mục tiêu (tối thiểu 10.000đ)"
              type="number"
              inputMode="numeric"
              placeholder="5000000"
              value={formTargetAmount}
              onChange={(e) => setFormTargetAmount(e.target.value)}
            />
            <TextField
              id="goal-date"
              label="Ngày dự kiến hoàn thành"
              type="date"
              value={formTargetDate}
              onChange={(e) => setFormTargetDate(e.target.value)}
            />
            {error && (
              <p style={{ color: 'var(--el-danger)', fontSize: 12, margin: '8px 0' }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setModalMode('none')} disabled={busy}>
                Huỷ
              </Button>
              <Button onClick={handleCreate} disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Đang tạo…' : 'Xác nhận tạo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nạp tiền vào mục tiêu */}
      {modalMode === 'deposit' && selectedGoal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 10, 20, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 900,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--el-surface)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Nạp vào: {selectedGoal.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '0 0 12px' }}>
              Số dư ví chính: {formatVnd(mainBalance)} | Đã có: {formatVnd(selectedGoal.currentAmount)}
            </p>
            <TextField
              id="deposit-amount"
              label="Số tiền muốn nạp từ ví chính"
              type="number"
              inputMode="numeric"
              placeholder="100000"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
            {error && (
              <p style={{ color: 'var(--el-danger)', fontSize: 12, margin: '8px 0' }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setModalMode('none')} disabled={busy}>
                Huỷ
              </Button>
              <Button onClick={() => handleDeposit(false)} disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Đang nạp…' : 'Xác nhận nạp'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rút tiền về ví */}
      {modalMode === 'withdraw' && selectedGoal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 10, 20, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 900,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--el-surface)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Rút từ: {selectedGoal.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '0 0 12px' }}>
              Khả dụng trong mục tiêu: {formatVnd(selectedGoal.currentAmount)}
            </p>
            <TextField
              id="withdraw-amount"
              label="Số tiền muốn rút về ví chính"
              type="number"
              inputMode="numeric"
              placeholder={String(selectedGoal.currentAmount)}
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
            {error && (
              <p style={{ color: 'var(--el-danger)', fontSize: 12, margin: '8px 0' }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setModalMode('none')} disabled={busy}>
                Huỷ
              </Button>
              <Button onClick={handleWithdraw} disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Đang rút…' : 'Rút về ví'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xem lịch sử giao dịch mục tiêu */}
      {modalMode === 'detail' && selectedGoal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 10, 20, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 900,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--el-surface)',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedGoal.name}</h3>
              <button
                onClick={() => setModalMode('none')}
                style={{ background: 'none', border: 0, fontSize: 18, cursor: 'pointer', color: 'var(--el-faint)' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 12 }}>
              Đã tích luỹ: <strong>{formatVnd(selectedGoal.currentAmount)}</strong> / {formatVnd(selectedGoal.targetAmount)}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {!goalDetail ? (
                <ProgressBar label="Đang tải lịch sử…" />
              ) : goalDetail.transactions.length === 0 ? (
                <p style={{ fontSize: 12.5, color: 'var(--el-faint)', textAlign: 'center', margin: '20px 0' }}>
                  Chưa có giao dịch nạp/rút nào cho mục tiêu này.
                </p>
              ) : (
                goalDetail.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--el-line)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {tx.type === 'DEPOSIT' ? 'Nạp tiền vào mục tiêu' : 'Rút tiền về ví chính'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--el-faint)' }}>{tx.createdAt.slice(0, 19).replace('T', ' ')}</div>
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: tx.type === 'DEPOSIT' ? 'var(--el-accent-ink)' : 'var(--el-danger)',
                      }}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{formatVnd(tx.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setModalMode('none')} style={{ width: '100%' }}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step-up modal for > 10m */}
      {stepUpOpen && (
        <StepUpModal
          message={stepUpMessage}
          onConfirm={async () => {
            if (pendingAction) await pendingAction();
          }}
          onCancel={() => {
            setStepUpOpen(false);
            setPendingAction(null);
          }}
        />
      )}
    </Screen>
  );
}

