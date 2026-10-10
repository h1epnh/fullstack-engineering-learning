import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';

/**
 * Withdrawal is synchronous (wallet-service's /debit responds immediately, no async bank leg to
 * wait for — see WalletServiceClient javadoc), so unlike top-up there's no PENDING/status-polling
 * step: this screen IS the result.
 */
export function WithdrawDone({
  balance,
  fee,
  onDone,
}: {
  balance: number;
  fee?: number;
  onDone: () => void;
}) {
  return (
    <Screen title="Rút tiền" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <Icon name="check_circle" size={40} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Rút tiền thành công</p>
          {fee !== undefined && fee > 0 && (
            <p style={{ fontSize: 12.5, color: '#e11d48', margin: 0 }}>
              Phí rút tiền merchant (vượt hạn mức 30tr): <strong>{formatVnd(fee)}</strong>
            </p>
          )}
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>
            Số dư mới: <strong>{formatVnd(balance)}</strong>
          </p>
        </div>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Button onClick={onDone}>Xong</Button>
      </div>
    </Screen>
  );
}
