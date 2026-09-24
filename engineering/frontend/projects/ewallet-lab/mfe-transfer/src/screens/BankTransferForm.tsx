import type { VietQrBank } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useState } from 'react';

const MESSAGE_MAX = 70;
const ACCOUNT_MIN_LEN = 6;
const DIGITS_VI = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(n: number, hasHigherPart: boolean): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const tens = Math.floor(rest / 10);
  const ones = rest % 10;
  const parts: string[] = [];
  if (hundred > 0 || hasHigherPart) parts.push(`${DIGITS_VI[hundred]} trăm`);
  if (tens === 0) {
    if (ones > 0) {
      if (hundred > 0 || hasHigherPart) parts.push('lẻ');
      parts.push(DIGITS_VI[ones]);
    }
  } else if (tens === 1) {
    parts.push('mười');
    if (ones === 1) parts.push('một');
    else if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(DIGITS_VI[ones]);
  } else {
    parts.push(`${DIGITS_VI[tens]} mươi`);
    if (ones === 1) parts.push('mốt');
    else if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(DIGITS_VI[ones]);
  }
  return parts.join(' ');
}

/** Display-only amount-in-words, matching MoMo's own "Hai trăm nghìn đồng" confirmation line. */
function vndAmountToWords(amount: number): string {
  if (amount <= 0) return '';
  const units = ['', ' nghìn', ' triệu', ' tỷ'];
  let n = Math.floor(amount);
  const groups: number[] = [];
  while (n > 0) {
    groups.unshift(n % 1000);
    n = Math.floor(n / 1000);
  }
  const total = groups.length;
  const words = groups
    .map((g, i) => {
      if (g === 0) return '';
      const hasHigherPart = groups.slice(0, i).some((x) => x > 0);
      return readThreeDigits(g, hasHigherPart) + units[total - 1 - i];
    })
    .filter(Boolean);
  const sentence = words.join(' ').trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ' đồng';
}

function stripDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function BankTransferForm({
  bank,
  senderName,
  onBack,
  onContinue,
}: {
  bank: VietQrBank;
  senderName: string;
  onBack: () => void;
  onContinue: (accountNumber: string, amount: number, message: string) => Promise<string | null>;
}) {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState(
    `${stripDiacritics(senderName).toUpperCase()} chuyen tien qua Ewallet Lab`.slice(0, MESSAGE_MAX),
  );
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const accountTouched = accountNumber.length > 0;
  const accountValid = /^\d+$/.test(accountNumber) && accountNumber.length >= ACCOUNT_MIN_LEN;
  const accountError = accountTouched && !accountValid;
  const canContinue = accountValid && amount !== '' && amount > 0;

  async function submit() {
    if (!canContinue) return;
    setLoading(true);
    setSubmitError(undefined);
    const err = await onContinue(accountNumber, amount as number, message);
    setLoading(false);
    if (err) setSubmitError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 20, cursor: 'pointer' }}
      >
        ← Đến ngân hàng
      </button>

      <div
        style={{
          background: 'var(--el-accent)',
          borderRadius: '14px 14px 0 0',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            overflow: 'hidden',
          }}
        >
          <img
            src={bank.logo}
            alt={bank.shortName}
            style={{ width: 30, height: 30, objectFit: 'contain', transform: 'scale(1.5)' }}
          />
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{bank.shortName}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)' }}>{bank.name}</div>
        </div>
      </div>

      <div
        style={{
          border: `1.5px solid ${accountError ? 'var(--el-danger)' : 'var(--el-accent)'}`,
          borderTop: 0,
          borderRadius: '0 0 14px 14px',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>
              Số thẻ/tài khoản <span style={{ color: 'var(--el-danger)' }}>*</span>
            </label>
            <input
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập số thẻ/tài khoản"
              style={{
                width: '100%',
                fontSize: 17,
                fontWeight: 700,
                border: 0,
                borderBottom: '1px solid var(--el-line)',
                background: 'transparent',
                color: 'var(--el-ink)',
                padding: '6px 0',
                outline: 'none',
              }}
            />
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 0,
              borderLeft: '1px solid var(--el-line)',
              paddingLeft: 10,
              color: 'var(--el-accent)',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'not-allowed',
              opacity: 0.55,
            }}
            title="Chưa hỗ trợ trong bản lab này"
          >
            <Icon name="contacts" size={16} />
            Chọn STK
          </button>
        </div>
        {accountError && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <Icon name="error" size={15} style={{ color: 'var(--el-danger)', flex: 'none', marginTop: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--el-danger)', lineHeight: 1.4 }}>
              Ngân hàng chưa xác thực được thông tin người nhận. Bạn kiểm tra và nhập lại số thẻ/tài khoản để thử lại
              nhé.
            </span>
          </div>
        )}
      </div>

      <Card>
        <label style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>
          Số tiền chuyển <span style={{ color: 'var(--el-danger)' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            inputMode="numeric"
            value={amount === '' ? '' : amount.toLocaleString('vi-VN')}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              setAmount(v === '' ? '' : Number(v));
            }}
            placeholder="0"
            style={{
              flex: 1,
              fontSize: 26,
              fontWeight: 700,
              fontFamily: 'var(--el-font-display)',
              border: 0,
              background: 'transparent',
              color: 'var(--el-ink)',
              outline: 'none',
              padding: '6px 0',
            }}
          />
          <span style={{ color: 'var(--el-muted)', fontSize: 15 }}>đ</span>
        </div>
        {amount !== '' && amount > 0 && (
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '4px 0 0' }}>{vndAmountToWords(amount)}</p>
        )}
      </Card>

      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>Lời nhắn</label>
            <span style={{ fontSize: 11, color: 'var(--el-faint)' }}>
              ({message.length}/{MESSAGE_MAX})
            </span>
          </div>
          <input
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              fontSize: 14,
              border: 0,
              background: 'transparent',
              color: 'var(--el-ink)',
              outline: 'none',
              padding: '4px 0',
            }}
          />
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Icon name="info" size={16} style={{ color: 'var(--el-muted)', flex: 'none', marginTop: 1 }} />
        <p style={{ fontSize: 11.5, color: 'var(--el-muted)', lineHeight: 1.5, margin: 0 }}>
          Dịch vụ thu hộ chi hộ do Ewallet Lab hỗ trợ các Ngân hàng đối tác cung cấp.
        </p>
      </div>

      {submitError && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)', flex: 'none', marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{submitError}</span>
        </div>
      )}

      <Button onClick={submit} disabled={!canContinue || loading}>
        {loading ? 'Đang xử lý…' : 'Tiếp tục'}
      </Button>
    </Screen>
  );
}
