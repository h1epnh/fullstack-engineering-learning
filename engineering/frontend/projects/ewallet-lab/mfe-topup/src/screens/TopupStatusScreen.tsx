import { type TopupStatus, topupService } from '@ewallet-lab/api-client';
import { Button, Card, ProgressBar, Screen, StatusPill } from '@ewallet-lab/ui';
import { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 1500;

/**
 * Polls for the IPN-driven confirmation — see topup-service/web/IpnController.java and
 * DESIGN.md "Top-up flow": the synchronous /topups response is only an ACK, this screen
 * is what actually waits for money to move. Cancel just stops polling client-side (per
 * MoMo's own guideline to give an abort option on slow operations); it does not cancel
 * the underlying bank-side transaction, which the mock gateway will still resolve.
 */
export function TopupStatusScreen({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const [status, setStatus] = useState<TopupStatus>('PENDING');
  const [cancelled, setCancelled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      const res = await topupService.getTopupStatus(orderId);
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
    <Screen title="Trạng thái nạp tiền" withNavGutter={false}>
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
            Đã dừng theo dõi. Giao dịch vẫn có thể được xác nhận ở phía ngân hàng — kiểm tra lại
            lịch sử giao dịch sau ít phút.
          </p>
        )}

        {status === 'CONFIRMED' && (
          <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Số dư ví đã được cập nhật.</p>
        )}

        {status === 'FAILED' && (
          <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>
            Ngân hàng từ chối giao dịch. Không có khoản tiền nào bị trừ.
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
