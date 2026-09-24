import { type TopupStatus, topupService } from '@ewallet-lab/api-client';
import { Button, Card, ProgressBar, Screen, StatusPill } from '@ewallet-lab/ui';
import { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 1500;

/**
 * Polls for the IPN-driven confirmation — mirrors mfe-topup's TopupStatusScreen, but the copy is
 * different for FAILED: unlike top-up (nothing was deducted until IPN confirms), this flow debits
 * the sender synchronously up front, so a FAILED IPN here means topup-service already refunded —
 * see BankTransferOutIpnController.java. Saying "no money was deducted" here would be wrong.
 */
export function BankTransferOutStatusScreen({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [status, setStatus] = useState<TopupStatus>('PENDING');
  const [cancelled, setCancelled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      const res = await topupService.getBankTransferOutStatus(orderId);
      if (res.status !== 'PENDING') {
        setStatus(res.status);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orderId]);

  function cancel() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCancelled(true);
  }

  return (
    <Screen title="Trạng thái chuyển khoản" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12.5, color: 'var(--el-faint)' }}>Mã đơn: {orderId}</span>
          <StatusPill status={cancelled ? 'PENDING' : status} />
        </div>

        {status === 'PENDING' && !cancelled && (
          <ProgressBar label="Đang chờ ngân hàng xác nhận (IPN)…" onCancel={cancel} />
        )}

        {status === 'PENDING' && cancelled && (
          <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>
            Đã dừng theo dõi. Số dư đã tạm bị trừ — kiểm tra lại lịch sử giao dịch sau ít phút để
            xem kết quả cuối cùng.
          </p>
        )}

        {status === 'CONFIRMED' && (
          <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>
            Ngân hàng đã xác nhận nhận được tiền.
          </p>
        )}

        {status === 'FAILED' && (
          <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>
            Ngân hàng từ chối giao dịch. Số tiền đã được hoàn lại vào ví.
          </p>
        )}
      </Card>

      {(status !== 'PENDING' || cancelled) && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={onDone}>Xong</Button>
        </div>
      )}
    </Screen>
  );
}
