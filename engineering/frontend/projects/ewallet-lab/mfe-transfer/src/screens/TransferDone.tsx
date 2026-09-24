import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';

export function TransferDone({
  toName,
  amount,
  newBalance,
  onDone,
}: {
  toName: string;
  amount: number;
  newBalance: number;
  onDone: () => void;
}) {
  return (
    <Screen title="Chuyển tiền" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <Icon name="check_circle" size={40} style={{ color: 'var(--el-accent)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Chuyển tiền thành công</p>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0, textAlign: 'center' }}>
            Đã chuyển <strong>{formatVnd(amount)}</strong> cho <strong>{toName}</strong>
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>
            Số dư mới: <strong>{formatVnd(newBalance)}</strong>
          </p>
        </div>
      </Card>
      <div style={{ marginTop: 16 }}>
        <Button onClick={onDone}>Xong</Button>
      </div>
    </Screen>
  );
}
