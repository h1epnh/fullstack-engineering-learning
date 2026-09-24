import { Button, Icon, Screen, TextField } from '@ewallet-lab/ui';
import { useState } from 'react';

const PHONE_RE = /^0\d{9}$/;

export function PhoneEntry({ onSubmit }: { onSubmit: (phone: string) => Promise<string | null> }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const localError = phone.length > 0 && !PHONE_RE.test(phone) ? 'Phải là số điện thoại VN hợp lệ (0 + 9 số).' : undefined;

  async function submit() {
    if (localError) return;
    setLoading(true);
    const err = await onSubmit(phone);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <div style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        <Icon name="account_balance_wallet" size={40} style={{ color: 'var(--el-accent)' }} />
        <h1 style={{ fontFamily: 'var(--el-font-display)', fontSize: 22, fontWeight: 800, margin: 0 }}>
          Ewallet Lab
        </h1>
        <p style={{ color: 'var(--el-muted)', fontSize: 13, margin: 0, textAlign: 'center' }}>
          Nhập số điện thoại để đăng nhập hoặc tạo tài khoản mới
        </p>
      </div>
      <TextField
        id="phone"
        label="Số điện thoại"
        placeholder="09xxxxxxxx"
        inputMode="numeric"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value.trim());
          setError(undefined);
        }}
        error={error ?? localError}
      />
      <Button onClick={submit} disabled={loading || phone.length === 0}>
        {loading ? 'Đang kiểm tra…' : 'Tiếp tục'}
      </Button>
      <p style={{ fontSize: 11.5, color: 'var(--el-faint)', textAlign: 'center', marginTop: 20 }}>
        Lab học tập — không có OTP/mật khẩu thật.
      </p>
    </Screen>
  );
}
