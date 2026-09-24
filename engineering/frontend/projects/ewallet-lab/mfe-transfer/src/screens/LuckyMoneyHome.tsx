import {
  ApiError,
  LUCKY_MONEY_MAX_AMOUNT,
  LUCKY_MONEY_MIN_AMOUNT,
  type LuckyMoney,
  type UserResponse,
  luckyMoneyService,
  userService,
} from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StatusPill, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PHONE_RE = /^0\d{9}$/;

type Tab = 'send' | 'sent' | 'received';

/**
 * Issue #10 — MVP scope only (1-1 lucky money): no group lucky money (max 9 people), no
 * random-amount mode, no SMS invite for a phone with no Ewallet Lab account — all explicitly out
 * of scope per the issue's Constraints, not bugs. Calls lucky-money-service :8097, which escrows
 * (debits the sender) at send time — different from payment-link/payment-reminder, which never
 * touch a wallet until the payer actively confirms (see backend DESIGN.md's architecture note).
 */
export function LuckyMoneyHome({
  selfUserId,
  selfName,
  onBack,
}: {
  selfUserId: string;
  selfName: string;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>('send');

  return (
    <Screen title="Giật lì xì" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <TabButton active={tab === 'send'} onClick={() => setTab('send')} label="Gửi lì xì" />
        <TabButton active={tab === 'sent'} onClick={() => setTab('sent')} label="Đã gửi" />
        <TabButton active={tab === 'received'} onClick={() => setTab('received')} label="Đã nhận" />
      </div>

      {tab === 'send' && <SendLuckyMoneyForm selfUserId={selfUserId} selfName={selfName} onSent={() => setTab('sent')} />}
      {tab === 'sent' && <LuckyMoneyList kind="sent" userId={selfUserId} />}
      {tab === 'received' && <LuckyMoneyList kind="received" userId={selfUserId} />}
    </Screen>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 6px',
        borderRadius: 10,
        border: `1.5px solid ${active ? 'var(--el-accent)' : 'var(--el-line)'}`,
        background: active ? 'var(--el-accent-soft)' : 'var(--el-surface)',
        color: active ? 'var(--el-accent-ink)' : 'var(--el-muted)',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function SendLuckyMoneyForm({ selfUserId, selfName, onSent }: { selfUserId: string; selfName: string; onSent: () => void }) {
  const [phone, setPhone] = useState('');
  const [recipient, setRecipient] = useState<UserResponse | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const localPhoneError = phone.length > 0 && !PHONE_RE.test(phone) ? 'Số điện thoại chưa hợp lệ.' : undefined;
  const amountOutOfRange =
    amount !== '' && (amount < LUCKY_MONEY_MIN_AMOUNT || amount > LUCKY_MONEY_MAX_AMOUNT)
      ? `Số tiền phải từ ${formatVnd(LUCKY_MONEY_MIN_AMOUNT)} đến ${formatVnd(LUCKY_MONEY_MAX_AMOUNT)}.`
      : undefined;

  async function search() {
    setLoading(true);
    setError(undefined);
    try {
      const user = await userService.getByPhone(phone);
      setRecipient(user);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'phone'));
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!recipient || amount === '' || amountOutOfRange) return;
    setLoading(true);
    setError(undefined);
    try {
      await luckyMoneyService.send(selfUserId, selfName, recipient.phone, amount, message.trim());
      setDone(true);
      setTimeout(onSent, 900);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'lucky-money'));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 0' }}>
          <Icon name="redeem" size={32} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>Đã gửi lì xì thành công</p>
        </div>
      </Card>
    );
  }

  if (!recipient) {
    return (
      <>
        <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '0 0 16px' }}>
          Số tiền tự nhập từ {formatVnd(LUCKY_MONEY_MIN_AMOUNT)} đến {formatVnd(LUCKY_MONEY_MAX_AMOUNT)}/lần — số dư của bạn
          sẽ bị trừ ngay khi gửi (giữ hộ/escrow); nếu người nhận không nhận trong 48 giờ, tiền tự động hoàn lại cho bạn.
        </p>
        <TextField
          id="lucky-money-phone"
          label="Số điện thoại người nhận"
          placeholder="09xxxxxxxx"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.trim());
            setError(undefined);
          }}
          error={error ?? localPhoneError}
        />
        <Button onClick={search} disabled={loading || phone.length === 0 || !!localPhoneError}>
          {loading ? 'Đang tìm…' : 'Tìm người nhận'}
        </Button>
      </>
    );
  }

  return (
    <>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--el-accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <Icon name="person" size={20} style={{ color: 'var(--el-accent-ink)' }} />
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{recipient.name}</div>
            <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{recipient.phone}</div>
          </div>
        </div>
      </Card>

      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '16px 0 6px' }}>Số tiền lì xì</p>
      <input
        inputMode="numeric"
        value={amount === '' ? '' : amount.toLocaleString('vi-VN')}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setAmount(v === '' ? '' : Number(v));
        }}
        placeholder="0đ"
        style={{
          width: '100%',
          fontSize: 24,
          fontWeight: 700,
          fontFamily: 'var(--el-font-display)',
          padding: '14px 16px',
          borderRadius: 12,
          border: `1.5px solid ${amountOutOfRange ? 'var(--el-danger)' : 'var(--el-line)'}`,
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          marginBottom: amountOutOfRange ? 6 : 16,
        }}
      />
      {amountOutOfRange && (
        <p style={{ fontSize: 12, color: 'var(--el-danger)', fontWeight: 600, margin: '0 0 16px' }}>{amountOutOfRange}</p>
      )}
      <TextField
        id="lucky-money-message"
        label="Lời chúc (không bắt buộc)"
        placeholder="Vd: Chúc mừng năm mới!"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button onClick={submit} disabled={loading || amount === '' || !!amountOutOfRange}>
          {loading ? 'Đang gửi…' : 'Gửi lì xì'}
        </Button>
        <Button variant="ghost" onClick={() => setRecipient(null)}>
          Đổi người khác
        </Button>
      </div>
    </>
  );
}

function LuckyMoneyList({ kind, userId }: { kind: 'sent' | 'received'; userId: string }) {
  const [items, setItems] = useState<LuckyMoney[] | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  function reload() {
    const load = kind === 'sent' ? luckyMoneyService.listSent : luckyMoneyService.listReceived;
    load(userId).then(setItems);
  }

  // Lazy-expiry lives server-side (GET auto-flips PENDING→EXPIRED_REFUNDED past expiresAt, see
  // lucky-money-service's LuckyMoneyService.checkExpiry) — this list simply re-fetches on mount.
  useEffect(reload, [kind, userId]);

  async function claimNow(id: string) {
    setClaimingId(id);
    setError(undefined);
    try {
      await luckyMoneyService.claim(id, userId);
      reload();
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'lucky-money'));
    } finally {
      setClaimingId(null);
    }
  }

  if (items === null) {
    return <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>;
  }

  if (items.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--el-faint)', textAlign: 'center', padding: '30px 0' }}>
        {kind === 'sent' ? 'Bạn chưa gửi lì xì nào.' : 'Chưa có ai lì xì cho bạn.'}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}
      {items.map((lm) => (
        <Card key={lm.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>{kind === 'sent' ? lm.toPhone : lm.fromName}</p>
              {lm.message && <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '4px 0 0' }}>“{lm.message}”</p>}
              <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '4px 0 0' }}>
                {new Date(lm.createdAt).toLocaleString('vi-VN')}
                {lm.status === 'PENDING' && ` · hết hạn ${new Date(lm.expiresAt).toLocaleString('vi-VN')}`}
              </p>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <p style={{ fontSize: 14, fontWeight: 800, margin: '0 0 6px' }}>{formatVnd(lm.amount)}</p>
              <StatusPill status={lm.status} />
            </div>
          </div>
          {kind === 'received' && lm.status === 'PENDING' && (
            <Button onClick={() => claimNow(lm.id)} disabled={claimingId === lm.id} style={{ marginTop: 12 }}>
              {claimingId === lm.id ? 'Đang nhận…' : 'Nhận lì xì'}
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
