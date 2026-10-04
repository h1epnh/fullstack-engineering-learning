import {
  ApiError,
  FUND_MIN_AMOUNT,
  STEP_UP_REQUIRED_STATUS,
  type Fund,
  type FundMember,
  type FundTransaction,
  fundService,
} from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StepUpModal, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

function describeFundError(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return 'Không kết nối được tới máy chủ. Kiểm tra lại các service đã chạy chưa rồi thử lại.';
}

const TX_LABEL: Record<FundTransaction['type'], { icon: string; label: string; sign: 1 | -1 }> = {
  CONTRIBUTION: { icon: 'south', label: 'Góp quỹ', sign: 1 },
  WITHDRAWAL: { icon: 'north', label: 'Rút quỹ', sign: -1 },
  DISSOLVE: { icon: 'flag', label: 'Giải thể (rút hết)', sign: -1 },
};

/**
 * Issue #14 — chi tiết 1 quỹ nhóm: số dư, thành viên, góp/rút tiền, lịch sử. Step-up (#15) được xử
 * lý CỤC BỘ ngay trong màn này (StepUpModal là overlay `position: fixed`, không bắt buộc phải là 1
 * "screen" riêng ở tầng App.tsx's state machine như luồng transfer/bank-transfer — xem StepUpModal's
 * javadoc) để tránh phải nhồi thêm state quỹ nhóm vào App.tsx's `Step` union.
 */
export function FundDetail({ fundId, selfUserId, onBack }: { fundId: string; selfUserId: string; onBack: () => void }) {
  const [fund, setFund] = useState<Fund | null | 'not-found'>(null);
  const [members, setMembers] = useState<FundMember[]>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [memberPhone, setMemberPhone] = useState('');
  const [contributeAmount, setContributeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState<'member' | 'contribute' | 'withdraw' | 'dissolve' | null>(null);
  const [stepUp, setStepUp] = useState<{ message: string; onConfirm: () => Promise<void> } | null>(null);

  function reload() {
    fundService
      .get(fundId, selfUserId)
      .then(setFund)
      .catch(() => setFund('not-found'));
    fundService.listMembers(fundId, selfUserId).then(setMembers).catch(() => setMembers([]));
    fundService.listTransactions(fundId, selfUserId).then(setTransactions).catch(() => setTransactions([]));
  }

  useEffect(reload, [fundId, selfUserId]);

  if (fund === null) {
    return (
      <Screen withNavGutter={false}>
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>
      </Screen>
    );
  }

  if (fund === 'not-found') {
    return (
      <Screen withNavGutter={false}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 10px' }}>
          <Icon name="group_off" size={40} style={{ color: 'var(--el-danger)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Không tìm thấy quỹ này, hoặc bạn không phải thành viên</p>
          <Button variant="ghost" onClick={onBack} style={{ maxWidth: 220 }}>
            Về danh sách quỹ
          </Button>
        </div>
      </Screen>
    );
  }

  const isCreator = fund.creatorUserId === selfUserId;
  const isActive = fund.status === 'ACTIVE';

  async function handleAddMember() {
    setError(undefined);
    if (!memberPhone.trim()) {
      setError('Nhập số điện thoại thành viên.');
      return;
    }
    setBusy('member');
    try {
      await fundService.addMember(fundId, selfUserId, memberPhone.trim());
      setMemberPhone('');
      reload();
    } catch (e) {
      setError(describeFundError(e));
    } finally {
      setBusy(null);
    }
  }

  async function doContribute(amount: number, stepUpConfirmed: boolean) {
    setBusy('contribute');
    try {
      await fundService.contribute(fundId, selfUserId, amount, stepUpConfirmed);
      setContributeAmount('');
      setStepUp(null);
      reload();
    } catch (e) {
      if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
        setStepUp({ message: e.message, onConfirm: () => doContribute(amount, true) });
        return;
      }
      setError(describeFundError(e));
      setStepUp(null);
    } finally {
      setBusy(null);
    }
  }

  function handleContribute() {
    setError(undefined);
    const amount = Number(contributeAmount);
    if (!amount || amount < FUND_MIN_AMOUNT) {
      setError(`Số tiền góp tối thiểu ${formatVnd(FUND_MIN_AMOUNT)}.`);
      return;
    }
    doContribute(amount, false);
  }

  async function handleWithdraw() {
    setError(undefined);
    const amount = Number(withdrawAmount);
    if (!amount || amount < FUND_MIN_AMOUNT) {
      setError(`Số tiền rút tối thiểu ${formatVnd(FUND_MIN_AMOUNT)}.`);
      return;
    }
    setBusy('withdraw');
    try {
      await fundService.withdraw(fundId, selfUserId, amount);
      setWithdrawAmount('');
      reload();
    } catch (e) {
      setError(describeFundError(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleDissolve() {
    if (!window.confirm('Giải thể quỹ sẽ rút toàn bộ số dư còn lại về ví của bạn và đóng quỹ vĩnh viễn. Tiếp tục?')) {
      return;
    }
    setError(undefined);
    setBusy('dissolve');
    try {
      await fundService.dissolve(fundId, selfUserId);
      reload();
    } catch (e) {
      setError(describeFundError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen title={fund.name} withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {fund.purpose && <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 6px' }}>{fund.purpose}</p>}
            <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: 0 }}>
              Người tạo: {fund.creatorName ?? fund.creatorPhone ?? '—'}
            </p>
          </div>
          {!isActive && (
            <span style={{ fontSize: 10.5, color: 'var(--el-faint)', border: '1px solid var(--el-line)', borderRadius: 999, padding: '1px 7px', flex: 'none' }}>
              Đã giải thể
            </span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--el-font-display)', fontWeight: 800, fontSize: 26, margin: '10px 0 0' }}>
          {formatVnd(fund.balance)}
        </p>
      </Card>

      {isActive && (
        <>
          <Card>
            <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>Góp quỹ</p>
            <TextField
              id="fund-contribute-amount"
              label="Số tiền (VNĐ)"
              type="number"
              inputMode="numeric"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
            />
            <Button onClick={handleContribute} disabled={busy !== null}>
              {busy === 'contribute' ? 'Đang góp…' : 'Góp vào quỹ'}
            </Button>
          </Card>

          {isCreator && (
            <Card>
              <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 10px' }}>Rút tiền khỏi quỹ</p>
              <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '0 0 10px' }}>
                MVP: chỉ người tạo quỹ mới được rút tiền (xem backend DESIGN.md).
              </p>
              <TextField
                id="fund-withdraw-amount"
                label="Số tiền (VNĐ)"
                type="number"
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <Button variant="secondary" onClick={handleWithdraw} disabled={busy !== null}>
                {busy === 'withdraw' ? 'Đang rút…' : 'Rút về ví của tôi'}
              </Button>
            </Card>
          )}

          {isCreator && (
            <Card>
              <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 8px' }}>Mời thành viên</p>
              <TextField
                id="fund-member-phone"
                label="Số điện thoại (đã có tài khoản Ewallet Lab)"
                type="tel"
                inputMode="tel"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                error={error}
              />
              <Button variant="secondary" onClick={handleAddMember} disabled={busy !== null}>
                {busy === 'member' ? 'Đang mời…' : 'Mời vào quỹ'}
              </Button>
            </Card>
          )}
        </>
      )}

      {error && isActive && !isCreator && (
        <p style={{ fontSize: 12.5, color: 'var(--el-danger)', margin: '0 0 10px' }}>{error}</p>
      )}

      <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
        Thành viên ({members.length})
      </h2>
      <Card>
        {members.map((m) => (
          <div key={m.memberUserId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 13 }}>
              {m.memberName ?? m.memberPhone}
              {m.memberUserId === fund.creatorUserId && (
                <span style={{ fontSize: 10.5, color: 'var(--el-muted)' }}> (người tạo)</span>
              )}
            </span>
            <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>{m.memberPhone}</span>
          </div>
        ))}
      </Card>

      <Button variant="ghost" onClick={() => setShowHistory((v) => !v)} style={{ margin: '16px 0 10px' }}>
        {showHistory ? 'Ẩn lịch sử giao dịch' : 'Xem lịch sử giao dịch'}
      </Button>
      {showHistory &&
        (transactions.length === 0 ? (
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>Chưa có giao dịch nào.</p>
        ) : (
          transactions.map((tx) => {
            const meta = TX_LABEL[tx.type];
            return (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--el-line)' }}>
                <Icon name={meta.icon} size={17} style={{ color: 'var(--el-muted)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>{new Date(tx.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <div style={{ fontFamily: 'var(--el-font-display)', fontWeight: 700, fontSize: 13 }}>
                  {meta.sign > 0 ? '+' : '-'}
                  {formatVnd(tx.amount)}
                </div>
              </div>
            );
          })
        ))}

      {isActive && isCreator && (
        <Button
          variant="ghost"
          onClick={handleDissolve}
          disabled={busy !== null}
          style={{ marginTop: 20, color: 'var(--el-danger)', borderColor: 'var(--el-danger)' }}
        >
          {busy === 'dissolve' ? 'Đang giải thể…' : 'Giải thể quỹ (rút hết về ví của tôi)'}
        </Button>
      )}

      {stepUp && (
        <StepUpModal message={stepUp.message} onConfirm={stepUp.onConfirm} onCancel={() => setStepUp(null)} />
      )}
    </Screen>
  );
}
