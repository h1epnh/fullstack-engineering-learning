import {
  ApiError,
  type PaymentRequest,
  type UserResponse,
  paymentRequestService,
  userService,
} from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StatusPill, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PHONE_RE = /^0\d{9}$/;

type Tab = 'create' | 'sent' | 'received';

/**
 * Issue #8 — single screen for both roles (whoever taps the "Nhắc trả tiền" tile could be the
 * reminder's creator or, on a different occasion, its target): a tab to create a reminder (phone
 * search reused from TransferHome's onSearch pattern), and 2 list tabs ("Đã gửi" / "Đã nhận").
 *
 * <p><strong>No real push notification</strong> (lab has no such infra, see backend DESIGN.md) —
 * the "Đã nhận" list is only refreshed by polling on mount/tab-switch, not pushed to the target
 * user. This is the adapted part of the MoMo flow, called out explicitly rather than pretended.
 */
export function PaymentReminderHome({
  selfUserId,
  selfPhone,
  selfName,
  onBack,
}: {
  selfUserId: string;
  selfPhone: string;
  selfName: string;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>('create');

  return (
    <Screen title="Nhắc trả tiền" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <TabButton active={tab === 'create'} onClick={() => setTab('create')} label="Nhắc nợ mới" />
        <TabButton active={tab === 'sent'} onClick={() => setTab('sent')} label="Đã gửi" />
        <TabButton active={tab === 'received'} onClick={() => setTab('received')} label="Đã nhận" />
      </div>

      {tab === 'create' && (
        <CreateReminderForm
          selfUserId={selfUserId}
          selfPhone={selfPhone}
          selfName={selfName}
          onCreated={() => setTab('sent')}
        />
      )}
      {tab === 'sent' && <ReminderList kind="sent" userId={selfUserId} />}
      {tab === 'received' && <ReminderList kind="received" userId={selfUserId} />}
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

function CreateReminderForm({
  selfUserId,
  selfPhone,
  selfName,
  onCreated,
}: {
  selfUserId: string;
  selfPhone: string;
  selfName: string;
  onCreated: () => void;
}) {
  const [phone, setPhone] = useState('');
  const [target, setTarget] = useState<UserResponse | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const localPhoneError = phone.length > 0 && !PHONE_RE.test(phone) ? 'Số điện thoại chưa hợp lệ.' : undefined;

  async function search() {
    if (phone === selfPhone) {
      setError('Không thể tự nhắc trả tiền chính mình.');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const user = await userService.getByPhone(phone);
      setTarget(user);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'phone'));
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!target || amount === '' || amount <= 0) return;
    setLoading(true);
    setError(undefined);
    try {
      await paymentRequestService.createReminder(selfUserId, selfPhone, selfName, target.phone, amount, message.trim());
      setDone(true);
      setTimeout(onCreated, 900);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'payment-reminder'));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 0' }}>
          <Icon name="check_circle" size={32} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>Đã gửi lời nhắc trả tiền</p>
        </div>
      </Card>
    );
  }

  if (!target) {
    return (
      <>
        <TextField
          id="reminder-phone"
          label="Số điện thoại người cần nhắc"
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
          {loading ? 'Đang tìm…' : 'Tìm người cần nhắc'}
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
            <div style={{ fontSize: 14, fontWeight: 700 }}>{target.name}</div>
            <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{target.phone}</div>
          </div>
        </div>
      </Card>

      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '16px 0 6px' }}>Số tiền cần nhắc</p>
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
          border: '1.5px solid var(--el-line)',
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          marginBottom: 16,
        }}
      />
      <TextField
        id="reminder-message"
        label="Lời nhắn (không bắt buộc)"
        placeholder="Vd: Tiền vé xe hôm qua"
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
        <Button onClick={submit} disabled={loading || amount === '' || amount <= 0}>
          {loading ? 'Đang gửi…' : 'Nhắc trả'}
        </Button>
        <Button variant="ghost" onClick={() => setTarget(null)}>
          Đổi người khác
        </Button>
      </div>
    </>
  );
}

function ReminderList({ kind, userId }: { kind: 'sent' | 'received'; userId: string }) {
  const [items, setItems] = useState<PaymentRequest[] | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  function reload() {
    const load = kind === 'sent' ? paymentRequestService.listSentReminders : paymentRequestService.listReceivedReminders;
    load(userId).then(setItems);
  }

  // "polling lúc mount" — no real push notification infra in this lab (see backend DESIGN.md).
  useEffect(reload, [kind, userId]);

  async function payNow(id: string) {
    setPayingId(id);
    setError(undefined);
    try {
      await paymentRequestService.payReminder(id, userId);
      reload();
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'payment-reminder'));
    } finally {
      setPayingId(null);
    }
  }

  if (items === null) {
    return <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải…</p>;
  }

  if (items.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--el-faint)', textAlign: 'center', padding: '30px 0' }}>
        {kind === 'sent' ? 'Bạn chưa gửi lời nhắc nào.' : 'Chưa có ai nhắc bạn trả tiền.'}
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
      {items.map((r) => (
        <Card key={r.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>
                {kind === 'sent' ? r.targetPhone : r.creatorName}
              </p>
              {r.message && <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '4px 0 0' }}>{r.message}</p>}
              <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '4px 0 0' }}>
                {new Date(r.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <p style={{ fontSize: 14, fontWeight: 800, margin: '0 0 6px' }}>{formatVnd(r.amount)}</p>
              <StatusPill status={r.status} />
            </div>
          </div>
          {kind === 'received' && r.status === 'PENDING' && (
            <Button
              onClick={() => payNow(r.id)}
              disabled={payingId === r.id}
              style={{ marginTop: 12 }}
            >
              {payingId === r.id ? 'Đang trả…' : 'Trả ngay'}
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
