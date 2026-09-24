import { ApiError, type LinkedBankAccount, type VietQrBank, vietQrService } from '@ewallet-lab/api-client';
import { Button, Screen, TextField, describeApiError } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

export function LinkBank({
  onLink,
  onLinked,
}: {
  onLink: (bankCode: string, accountNumber: string) => Promise<LinkedBankAccount>;
  onLinked: (account: LinkedBankAccount) => void;
}) {
  const [banks, setBanks] = useState<VietQrBank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vietQrService.listBanks().then((list) => {
      setBanks(list);
      setBankCode((current) => current || list[0]?.code || '');
    });
  }, []);

  async function submit() {
    setLoading(true);
    try {
      const account = await onLink(bankCode, accountNumber);
      onLinked(account);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'link-bank'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Liên kết ngân hàng" withNavGutter={false}>
      <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: '0 0 20px' }}>
        Cần liên kết một tài khoản ngân hàng trước khi nạp tiền. Lab này không xác minh chủ tài
        khoản thật (xem README).
      </p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--el-muted)', display: 'block', marginBottom: 6 }}>
          Ngân hàng
        </label>
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
          disabled={banks.length === 0}
          style={{
            width: '100%',
            fontSize: 15,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--el-line)',
            background: 'var(--el-surface)',
            color: 'var(--el-ink)',
          }}
        >
          {banks.length === 0 && <option>Đang tải danh sách ngân hàng…</option>}
          {banks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.shortName}
            </option>
          ))}
        </select>
      </div>
      <TextField
        id="accountNumber"
        label="Số tài khoản"
        placeholder="0011002233"
        value={accountNumber}
        onChange={(e) => {
          setAccountNumber(e.target.value.trim());
          setError(undefined);
        }}
        error={error}
      />
      <Button onClick={submit} disabled={loading || accountNumber.length === 0 || bankCode === ''}>
        {loading ? 'Đang liên kết…' : 'Liên kết tài khoản'}
      </Button>
    </Screen>
  );
}
