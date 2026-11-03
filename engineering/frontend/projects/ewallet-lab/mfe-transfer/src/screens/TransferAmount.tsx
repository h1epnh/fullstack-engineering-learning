import type { UserResponse } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

export const GREETING_THEMES = [
  {
    id: 'BIRTHDAY',
    label: '🎂 Sinh nhật',
    icon: 'cake',
    color: '#d81b60',
    bg: '#fce4ec',
    border: '#f8bbd0',
    title: 'Chúc Mừng Sinh Nhật!',
    defaultWish: 'Chúc bạn tuổi mới rực rỡ, thành công và luôn hạnh phúc ngập tràn nhé!',
  },
  {
    id: 'THANK_YOU',
    label: '💐 Cảm ơn',
    icon: 'volunteer_activism',
    color: '#00897b',
    bg: '#e0f2f1',
    border: '#b2dfdb',
    title: 'Tri Ân & Cảm Ơn!',
    defaultWish: 'Cảm ơn bạn rất nhiều vì sự đồng hành và giúp đỡ quý báu!',
  },
  {
    id: 'CELEBRATION',
    label: '🎊 Chúc mừng',
    icon: 'celebration',
    color: '#c62828',
    bg: '#ffebee',
    border: '#ffcdd2',
    title: 'Chúc Mừng Hỷ Sự!',
    defaultWish: 'Chúc mừng tin vui ngập tràn, vạn sự hanh thông như ý!',
  },
  {
    id: 'CHEER_UP',
    label: '🌟 Cổ vũ',
    icon: 'emoji_events',
    color: '#ef6c00',
    bg: '#fff3e0',
    border: '#ffe0b2',
    title: 'Cổ Vũ & Động Viên!',
    defaultWish: 'Cố lên nhé bạn ơi! Thành công và may mắn sẽ luôn mỉm cười!',
  },
] as const;

export type GreetingThemeId = typeof GREETING_THEMES[number]['id'];

export const AUSPICIOUS_AMOUNTS = [
  { amount: 68000, label: '68.000đ', meaning: 'Lộc Phát', wish: 'Lộc phát hanh thông, tài vận dồi dào!' },
  { amount: 88000, label: '88.000đ', meaning: 'Phát Tài', wish: 'Phát tài phát lộc, vạn sự thuận buồm!' },
  { amount: 99000, label: '99.000đ', meaning: 'Trường Cửu', wish: 'Tình cảm bền chặt, mãi mãi trường cửu!' },
  { amount: 168000, label: '168.000đ', meaning: 'Nhất Lộc Phát', wish: 'Nhất lộc phát tài, vạn sự như ý cát tường!' },
  { amount: 686868, label: '686.868đ', meaning: 'Đại Lộc Phát', wish: 'Đại lộc đại phát, kinh doanh hồng phát!' },
  { amount: 999999, label: '999.999đ', meaning: 'Tam Cửu Viên Mãn', wish: 'Tam cửu đại cát, bình an viên mãn!' },
] as const;

export function TransferAmount({
  recipient,
  initialWithCard = false,
  onBack,
  onSubmit,
}: {
  recipient: UserResponse;
  initialWithCard?: boolean;
  onBack: () => void;
  onSubmit: (amount: number, greetingCardTheme?: string, greetingMessage?: string) => Promise<string | null>;
}) {
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // Issue #92: Trạng thái thiệp chúc mừng
  const [withCard, setWithCard] = useState<boolean>(initialWithCard);
  const [selectedTheme, setSelectedTheme] = useState<GreetingThemeId>('BIRTHDAY');
  const [greetingMessage, setGreetingMessage] = useState<string>('');

  const currentTheme = GREETING_THEMES.find((t) => t.id === selectedTheme) ?? GREETING_THEMES[0];

  function handleSelectTheme(themeId: GreetingThemeId) {
    setSelectedTheme(themeId);
    const theme = GREETING_THEMES.find((t) => t.id === themeId);
    if (theme && (!greetingMessage || GREETING_THEMES.some((t) => t.defaultWish === greetingMessage))) {
      setGreetingMessage(theme.defaultWish);
    }
  }

  function handleSelectAuspiciousAmount(item: typeof AUSPICIOUS_AMOUNTS[number]) {
    setAmount(item.amount);
    setError(undefined);
    if (!greetingMessage || greetingMessage.trim() === '' || GREETING_THEMES.some((t) => t.defaultWish === greetingMessage)) {
      setGreetingMessage(item.wish);
    }
  }

  async function submit() {
    if (amount === '' || amount <= 0) return;
    setLoading(true);
    const theme = withCard ? selectedTheme : undefined;
    const msg = withCard ? (greetingMessage.trim() || currentTheme.defaultWish) : undefined;
    const err = await onSubmit(amount, theme, msg);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <button
        type="button"
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Đổi người nhận
      </button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <Icon name="person" size={22} style={{ color: 'var(--el-accent-ink)' }} />
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{recipient.name}</div>
            <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>{recipient.phone}</div>
          </div>
        </div>
      </Card>

      {/* Nút bật/tắt thiệp mừng (Issue #92) */}
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={() => {
            const next = !withCard;
            setWithCard(next);
            if (next && !greetingMessage) {
              setGreetingMessage(currentTheme.defaultWish);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 14px',
            borderRadius: 12,
            border: `1.5px solid ${withCard ? 'var(--el-accent)' : 'var(--el-line)'}`,
            background: withCard ? 'var(--el-accent-soft)' : 'var(--el-surface)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>💌</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: withCard ? 'var(--el-accent-ink)' : 'var(--el-ink)' }}>
                {withCard ? 'Đang gửi kèm Thiệp chúc mừng' : 'Gửi kèm Thiệp chúc mừng & Tiền may mắn'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--el-muted)' }}>
                {withCard ? 'Chọn chủ đề và lời chúc cá nhân hoá bên dưới' : 'Thêm thiệp rực rỡ và chọn số tiền phong thuỷ'}
              </div>
            </div>
          </div>
          <Icon
            name={withCard ? 'check_circle' : 'add_circle_outline'}
            size={22}
            style={{ color: withCard ? 'var(--el-accent)' : 'var(--el-muted)' }}
          />
        </button>
      </div>

      {/* Khu vực tuỳ chỉnh Thiệp chúc mừng */}
      {withCard && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Chọn 4 chủ đề thiệp */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-muted)', margin: '0 0 8px' }}>
              CHỌN CHỦ ĐỀ THIỆP
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {GREETING_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? theme.color : 'var(--el-line)'}`,
                      background: isSelected ? theme.bg : 'var(--el-surface)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12.5,
                      color: isSelected ? theme.color : 'var(--el-ink)',
                    }}
                  >
                    <Icon name={theme.icon} size={18} style={{ color: theme.color }} />
                    <span>{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tấm thiệp Preview động */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: currentTheme.bg,
              border: `1.5px solid ${currentTheme.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name={currentTheme.icon} size={22} style={{ color: currentTheme.color }} />
              <strong style={{ fontSize: 14, color: currentTheme.color }}>{currentTheme.title}</strong>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--el-ink)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
              &ldquo;{greetingMessage || currentTheme.defaultWish}&rdquo;
            </p>
          </div>

          {/* Lưới chọn nhanh số tiền phong thuỷ */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-muted)', margin: '0 0 8px' }}>
              GỢI Ý SỐ TIỀN MAY MẮN
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {AUSPICIOUS_AMOUNTS.map((item) => {
                const isCurrent = amount === item.amount;
                return (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => handleSelectAuspiciousAmount(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: `1.5px solid ${isCurrent ? 'var(--el-accent)' : 'var(--el-line)'}`,
                      background: isCurrent ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: isCurrent ? 'var(--el-accent-ink)' : 'var(--el-ink)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--el-muted)' }}>{item.meaning}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ô nhập lời chúc cá nhân hoá */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 6px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-muted)' }}>LỜI NHẮN THIỆP (TỐI ĐA 150 KÝ TỰ)</span>
              <span style={{ fontSize: 11, color: greetingMessage.length > 150 ? 'var(--el-danger)' : 'var(--el-muted)' }}>
                {greetingMessage.length}/150
              </span>
            </div>
            <textarea
              maxLength={150}
              rows={2}
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              placeholder="Nhập lời chúc riêng của bạn..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid var(--el-line)',
                background: 'var(--el-surface)',
                color: 'var(--el-ink)',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}

      {/* Ô nhập số tiền */}
      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', margin: '18px 0 6px' }}>Số tiền chuyển</p>
      <input
        inputMode="numeric"
        value={amount === '' ? '' : amount.toLocaleString('vi-VN')}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setAmount(v === '' ? '' : Number(v));
          setError(undefined);
        }}
        placeholder="0đ"
        style={{
          width: '100%',
          fontSize: 26,
          fontWeight: 700,
          fontFamily: 'var(--el-font-display)',
          padding: '14px 16px',
          borderRadius: 12,
          border: `1.5px solid ${error ? 'var(--el-danger)' : 'var(--el-line)'}`,
          background: 'var(--el-surface)',
          color: 'var(--el-ink)',
          marginBottom: 6,
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}
      {!error && <div style={{ marginBottom: 16 }} />}

      <Button onClick={submit} disabled={loading || amount === '' || amount <= 0}>
        {loading ? 'Đang chuyển…' : withCard ? `Gửi thiệp & chuyển ${amount ? formatVnd(amount) : ''}` : `Chuyển ${amount ? formatVnd(amount) : ''}`}
      </Button>
    </Screen>
  );
}
