import { Button, Screen, TextField } from '@ewallet-lab/ui';
import { useState } from 'react';

export function Register({
  phone,
  onBack,
  onSubmit,
}: {
  phone: string;
  onBack: () => void;
  onSubmit: (phone: string, name: string) => Promise<string | null>;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const err = await onSubmit(phone, name);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <Screen withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 20, cursor: 'pointer' }}
      >
        ← Đổi số điện thoại
      </button>
      <h1 style={{ fontFamily: 'var(--el-font-display)', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>
        Tạo tài khoản mới
      </h1>
      <p style={{ color: 'var(--el-muted)', fontSize: 13, margin: '0 0 24px' }}>
        Số điện thoại <strong>{phone}</strong> chưa có tài khoản. Nhập tên để tiếp tục.
      </p>
      <TextField
        id="name"
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(undefined);
        }}
        error={error}
      />
      <Button onClick={submit} disabled={loading || name.trim().length === 0}>
        {loading ? 'Đang tạo…' : 'Đăng ký'}
      </Button>
    </Screen>
  );
}
