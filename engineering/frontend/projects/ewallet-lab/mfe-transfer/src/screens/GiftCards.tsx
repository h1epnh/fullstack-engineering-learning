import {
  ApiError,
  type GiftCardTemplate,
  type GiftCardTransfer,
  type UserResponse,
  giftCardService,
  userService,
} from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StatusPill, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PHONE_RE = /^0\d{9}$/;

type Tab = 'send' | 'received' | 'sent';

export function GiftCards({
  selfUserId,
  selfName,
  onBack,
  onStepUpRequest,
}: {
  selfUserId: string;
  selfName: string;
  onBack: () => void;
  onStepUpRequest?: (message: string, onConfirm: () => Promise<void>) => void;
}) {
  const [tab, setTab] = useState<Tab>('send');

  return (
    <Screen title="Thiệp mừng & Quà tặng" withNavGutter={false}>
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
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Icon name="arrow_back" size={16} /> Quay lại
      </button>

      {/* Banner Disclaimer */}
      <div
        style={{
          background: 'var(--el-surface-2)',
          border: '1px solid var(--el-line)',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--el-muted)',
        }}
      >
        <Icon name="celebration" size={20} style={{ color: 'var(--el-accent)' }} />
        <div>
          <strong style={{ color: 'var(--el-text)' }}>Thiệp mừng điện tử:</strong> Gửi gắm tình cảm và tiền mừng trực tiếp vào ví người nhận kèm thiệp chúc mừng ý nghĩa.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <TabButton active={tab === 'send'} onClick={() => setTab('send')} label="Gửi thiệp" icon="card_giftcard" />
        <TabButton active={tab === 'received'} onClick={() => setTab('received')} label="Thiệp đã nhận" icon="mark_email_read" />
        <TabButton active={tab === 'sent'} onClick={() => setTab('sent')} label="Đã gửi" icon="outbox" />
      </div>

      {tab === 'send' && (
        <SendGiftCardForm
          selfUserId={selfUserId}
          selfName={selfName}
          onSent={() => setTab('sent')}
          onStepUpRequest={onStepUpRequest}
        />
      )}
      {tab === 'received' && <ReceivedGiftCardsList selfUserId={selfUserId} />}
      {tab === 'sent' && <SentGiftCardsList selfUserId={selfUserId} />}
    </Screen>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 6px',
        borderRadius: 10,
        border: `1.5px solid ${active ? 'var(--el-accent)' : 'var(--el-line)'}`,
        background: active ? 'var(--el-accent-soft)' : 'var(--el-surface)',
        color: active ? 'var(--el-accent-ink)' : 'var(--el-muted)',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  );
}

function SendGiftCardForm({
  selfUserId,
  selfName,
  onSent,
  onStepUpRequest,
}: {
  selfUserId: string;
  selfName: string;
  onSent: () => void;
  onStepUpRequest?: (message: string, onConfirm: () => Promise<void>) => void;
}) {
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GiftCardTemplate | null>(null);
  const [phone, setPhone] = useState('');
  const [recipient, setRecipient] = useState<UserResponse | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    giftCardService.getTemplates().then((tpls) => {
      setTemplates(tpls);
      if (tpls.length > 0) {
        setSelectedTemplate(tpls[0]);
        setMessage(tpls[0].defaultMessage);
      }
    }).catch(console.error);
  }, []);

  async function searchRecipient() {
    if (!PHONE_RE.test(phone)) return;
    setLoading(true);
    setError(undefined);
    try {
      const user = await userService.getByPhone(phone);
      if (user.id === selfUserId) {
        setError('Không thể gửi thiệp mừng cho chính mình.');
        setRecipient(null);
      } else {
        setRecipient(user);
      }
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'phone'));
      setRecipient(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTemplate(tpl: GiftCardTemplate) {
    setSelectedTemplate(tpl);
    if (!message || templates.some((t) => t.defaultMessage === message)) {
      setMessage(tpl.defaultMessage);
    }
  }

  async function handleSubmit(stepUpConfirmed = false) {
    if (!recipient || !selectedTemplate || !amount || typeof amount !== 'number') return;
    setSubmitting(true);
    setError(undefined);
    try {
      await giftCardService.send({
        senderId: selfUserId,
        senderName: selfName,
        recipientPhone: recipient.phone,
        amount: Number(amount),
        templateCode: selectedTemplate.templateCode,
        customMessage: message,
        stepUpConfirmed,
      });
      onSent();
    } catch (e) {
      if (e instanceof ApiError && e.status === 428 && onStepUpRequest) {
        onStepUpRequest(e.message, () => handleSubmit(true));
      } else if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Không thể gửi thiệp mừng. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Chọn người nhận */}
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13.5 }}>1. Người nhận thiệp mừng</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Số điện thoại người nhận"
              value={phone}
              onChange={(val) => {
                setPhone(val);
                if (recipient) setRecipient(null);
                if (error) setError(undefined);
              }}
              placeholder="0912345678"
            />
          </div>
          <div style={{ alignSelf: 'flex-end', marginBottom: 2 }}>
            <Button
              variant="outline"
              onClick={searchRecipient}
              disabled={!PHONE_RE.test(phone) || loading}
            >
              {loading ? 'Đang tìm...' : 'Tìm'}
            </Button>
          </div>
        </div>

        {recipient && (
          <div
            style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--el-accent-soft)',
              color: 'var(--el-accent-ink)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="check_circle" size={18} />
            <span>Người nhận: <strong>{recipient.name}</strong> ({recipient.phone})</span>
          </div>
        )}
      </Card>

      {/* 2. Chọn chủ đề thiệp */}
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13.5 }}>2. Chọn chủ đề thiệp mừng</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {templates.map((tpl) => {
            const isSelected = selectedTemplate?.templateCode === tpl.templateCode;
            return (
              <button
                key={tpl.templateCode}
                onClick={() => handleSelectTemplate(tpl)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: `2px solid ${isSelected ? 'var(--el-accent)' : 'var(--el-line)'}`,
                  background: isSelected ? 'var(--el-accent-soft)' : 'var(--el-surface-2)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isSelected ? 'var(--el-accent)' : 'var(--el-surface)',
                    color: isSelected ? '#fff' : 'var(--el-accent-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={tpl.icon} size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--el-accent-ink)' : 'var(--el-text)' }}>
                    {tpl.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Khung xem trước Live Preview */}
      {selectedTemplate && (
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="visibility" size={16} /> Xem trước tấm thiệp
          </div>
          <div
            style={{
              padding: '24px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--el-surface-2) 0%, var(--el-surface) 100%)',
              border: '2px dashed var(--el-line)',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: 12,
                borderRadius: '50%',
                background: 'var(--el-accent-soft)',
                color: 'var(--el-accent-ink)',
                marginBottom: 12,
              }}
            >
              <Icon name={selectedTemplate.icon} size={32} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--el-accent-ink)', marginBottom: 6 }}>
              {selectedTemplate.title}
            </div>
            <div style={{ fontSize: 13.5, fontStyle: 'italic', color: 'var(--el-text)', marginBottom: 16, lineHeight: 1.5 }}>
              "{message || selectedTemplate.defaultMessage}"
            </div>
            <div style={{ borderTop: '1px solid var(--el-line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--el-muted)' }}>
              <span>Từ: <strong>{selfName}</strong></span>
              <span>Gửi đến: <strong>{recipient ? recipient.name : 'Người thương'}</strong></span>
            </div>
            {amount !== '' && Number(amount) > 0 && (
              <div style={{ marginTop: 10, fontSize: 16, fontWeight: 800, color: 'var(--el-accent)' }}>
                🎁 Tiền mừng: +{formatVnd(Number(amount))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 4. Nhập tiền mừng & lời chúc */}
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13.5 }}>3. Tiền mừng & Lời chúc</div>
        <TextField
          label="Số tiền mừng (VND)"
          value={amount === '' ? '' : String(amount)}
          onChange={(val) => {
            const num = val.replace(/\D/g, '');
            setAmount(num ? Number(num) : '');
          }}
          placeholder="Tối thiểu 1.000đ"
        />

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, marginBottom: 14 }}>
          {[50000, 100000, 200000, 500000, 1000000, 2000000].map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setAmount(quick)}
              style={{
                padding: '4px 10px',
                borderRadius: 16,
                border: '1px solid var(--el-line)',
                background: amount === quick ? 'var(--el-accent)' : 'var(--el-surface-2)',
                color: amount === quick ? '#fff' : 'var(--el-text)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              +{formatVnd(quick)}
            </button>
          ))}
        </div>

        <TextField
          label="Lời chúc riêng (tối đa 255 ký tự)"
          value={message}
          onChange={setMessage}
          placeholder="Nhập lời chúc riêng của bạn..."
        />

        {error && (
          <div style={{ color: 'var(--el-danger)', fontSize: 13, marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <Button
            variant="solid"
            onClick={() => handleSubmit(false)}
            disabled={!recipient || !amount || Number(amount) < 1000 || submitting}
          >
            {submitting ? 'Đang gửi thiệp...' : `Gửi thiệp mừng ${amount ? `(${formatVnd(Number(amount))})` : ''}`}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ReceivedGiftCardsList({ selfUserId }: { selfUserId: string }) {
  const [cards, setCards] = useState<GiftCardTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<GiftCardTransfer | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  useEffect(() => {
    loadCards();
  }, [selfUserId]);

  function loadCards() {
    setLoading(true);
    giftCardService.getReceived(selfUserId)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  async function handleOpenCard(card: GiftCardTransfer) {
    if (card.status === 'SENT') {
      try {
        const opened = await giftCardService.open(card.id, selfUserId);
        setActiveCard(opened);
        setCards((prev) => prev.map((c) => (c.id === card.id ? opened : c)));
      } catch (e) {
        console.error(e);
        setActiveCard(card);
      }
    } else {
      setActiveCard(card);
    }
  }

  async function handleSendReply() {
    if (!activeCard || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const updated = await giftCardService.reply(activeCard.id, selfUserId, replyText.trim());
      setActiveCard(updated);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setReplySuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReply(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 30, color: 'var(--el-muted)' }}>Đang tải danh sách thiệp mừng...</div>;
  }

  if (cards.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--el-muted)' }}>
          <Icon name="mail" size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
          <div>Bạn chưa nhận được thiệp mừng nào.</div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Modal / Card chi tiết khi mở thiệp */}
      {activeCard && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--el-surface)',
              borderRadius: 20,
              maxWidth: 420,
              width: '100%',
              padding: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => {
                setActiveCard(null);
                setReplyText('');
                setReplySuccess(false);
              }}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'none',
                border: 0,
                color: 'var(--el-muted)',
                cursor: 'pointer',
              }}
            >
              <Icon name="close" size={20} />
            </button>

            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--el-accent-soft)',
                color: 'var(--el-accent-ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Icon name="mark_email_read" size={32} />
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--el-text)', marginBottom: 4 }}>
              Thiệp mừng từ {activeCard.senderName}
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--el-accent)', marginBottom: 12 }}>
              +{formatVnd(activeCard.amount)}
            </div>

            <div
              style={{
                background: 'var(--el-surface-2)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 14,
                fontStyle: 'italic',
                color: 'var(--el-text)',
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              "{activeCard.customMessage || 'Chúc mừng!'}"
            </div>

            <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 20 }}>
              Tiền mừng đã được chuyển thẳng vào Ví chính của bạn lúc {new Date(activeCard.createdAt).toLocaleString('vi-VN')}
            </div>

            {/* Khung phản hồi cảm ơn */}
            {activeCard.replyMessage ? (
              <div
                style={{
                  background: 'var(--el-accent-soft)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--el-accent-ink)',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Lời cảm ơn của bạn:</div>
                <div>"{activeCard.replyMessage}"</div>
              </div>
            ) : (
              <div style={{ textAlign: 'left', marginTop: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Gửi lời cảm ơn đến người gửi:</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <TextField
                      value={replyText}
                      onChange={setReplyText}
                      placeholder="Cảm ơn bạn rất nhiều!..."
                    />
                  </div>
                  <Button
                    variant="solid"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || submittingReply}
                  >
                    {submittingReply ? '...' : 'Gửi'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {cards.map((card) => {
        const isOpened = card.status === 'OPENED';
        return (
          <Card key={card.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name={isOpened ? 'mail_outline' : 'mark_email_unread'} size={20} style={{ color: isOpened ? 'var(--el-muted)' : 'var(--el-accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{card.senderName}</span>
              </div>
              <StatusPill tone={isOpened ? 'muted' : 'accent'}>
                {isOpened ? 'Đã mở' : 'Thiệp mới'}
              </StatusPill>
            </div>

            <div style={{ fontSize: 13, color: 'var(--el-text)', marginBottom: 6 }}>
              Tiền mừng: <strong style={{ color: 'var(--el-accent)', fontSize: 15 }}>+{formatVnd(card.amount)}</strong>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--el-muted)', fontStyle: 'italic', marginBottom: 12 }}>
              "{card.customMessage || 'Chúc mừng!'}"
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--el-line)', paddingTop: 10 }}>
              <span style={{ fontSize: 11.5, color: 'var(--el-muted)' }}>
                {new Date(card.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <Button
                variant={isOpened ? 'outline' : 'solid'}
                onClick={() => handleOpenCard(card)}
              >
                {isOpened ? 'Xem thiệp & Lời chúc' : 'Bóc mở thiệp'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SentGiftCardsList({ selfUserId }: { selfUserId: string }) {
  const [cards, setCards] = useState<GiftCardTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    giftCardService.getSent(selfUserId)
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selfUserId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 30, color: 'var(--el-muted)' }}>Đang tải danh sách thiệp đã gửi...</div>;
  }

  if (cards.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--el-muted)' }}>
          <Icon name="outbox" size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
          <div>Bạn chưa gửi thiệp mừng nào.</div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cards.map((card) => {
        const isOpened = card.status === 'OPENED';
        return (
          <Card key={card.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Gửi tới: </span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{card.recipientName} ({card.recipientPhone})</span>
              </div>
              <StatusPill tone={isOpened ? 'success' : 'amber'}>
                {isOpened ? 'Người nhận đã mở' : 'Đang chờ mở'}
              </StatusPill>
            </div>

            <div style={{ fontSize: 13, color: 'var(--el-text)', marginBottom: 6 }}>
              Tiền mừng: <strong style={{ color: 'var(--el-accent)', fontSize: 14 }}>-{formatVnd(card.amount)}</strong>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--el-muted)', fontStyle: 'italic', marginBottom: 10 }}>
              "{card.customMessage || 'Chúc mừng!'}"
            </div>

            {card.replyMessage && (
              <div
                style={{
                  background: 'var(--el-accent-soft)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: 'var(--el-accent-ink)',
                  marginBottom: 8,
                }}
              >
                💌 Lời cảm ơn từ người nhận: <strong>"{card.replyMessage}"</strong>
              </div>
            )}

            <div style={{ fontSize: 11.5, color: 'var(--el-muted)', borderTop: '1px solid var(--el-line)', paddingTop: 8 }}>
              Gửi ngày: {new Date(card.createdAt).toLocaleString('vi-VN')}
              {card.openedAt && ` · Mở lúc: ${new Date(card.openedAt).toLocaleString('vi-VN')}`}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
