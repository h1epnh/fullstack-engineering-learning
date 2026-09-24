import { ApiError, type PaymentRequest, paymentRequestService } from '@ewallet-lab/api-client';
import { Button, Card, Icon, Screen, StatusPill, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Reached via the shell's minimal deep-link mechanism (issue #3's Task step 3 — shell reads
 * `window.location.pathname` once at startup, see shell/src/App.tsx) as well as normally if the
 * payer happens to already be inside mfe-transfer. Fetches by opaque token (the payer doesn't
 * know the creator's phone number ahead of time, unlike today's regular P2P search flow).
 */
export function PaymentLinkPay({
  token,
  selfUserId,
  onBack,
  onPaid,
}: {
  token: string;
  selfUserId: string;
  onBack: () => void;
  onPaid: (link: PaymentRequest) => void;
}) {
  const [link, setLink] = useState<PaymentRequest | null | 'not-found'>(null);
  const [error, setError] = useState<string | undefined>();
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    paymentRequestService
      .getLink(token)
      .then(setLink)
      .catch(() => setLink('not-found'));
  }, [token]);

  if (link === null) {
    return (
      <Screen withNavGutter={false}>
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải thông tin link…</p>
      </Screen>
    );
  }

  if (link === 'not-found') {
    return (
      <Screen withNavGutter={false}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 10px' }}>
          <Icon name="link_off" size={40} style={{ color: 'var(--el-danger)' }} />
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Không tìm thấy link nhận tiền này</p>
          <Button variant="ghost" onClick={onBack} style={{ maxWidth: 200 }}>
            Về trang chủ
          </Button>
        </div>
      </Screen>
    );
  }

  const isSelf = link.creatorUserId === selfUserId;
  const canPay = link.status === 'PENDING' && !isSelf;

  async function pay() {
    setPaying(true);
    try {
      const paid = await paymentRequestService.payLink(token, selfUserId);
      onPaid(paid);
    } catch (e) {
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'payment-link'));
    } finally {
      setPaying(false);
    }
  }

  return (
    <Screen title="Link nhận tiền" withNavGutter={false}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'var(--el-muted)' }}>Người nhận</span>
            <StatusPill status={link.status} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{link.creatorName}</p>
          <p style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--el-font-display)', margin: '6px 0' }}>
            {formatVnd(link.amount)}
          </p>
          {link.message && <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: 0 }}>“{link.message}”</p>}
        </div>
      </Card>

      {isSelf && (
        <p style={{ fontSize: 12.5, color: 'var(--el-muted)', marginTop: 16 }}>
          Đây là link bạn tự tạo — không thể tự thanh toán cho chính mình.
        </p>
      )}
      {!isSelf && link.status !== 'PENDING' && (
        <p style={{ fontSize: 12.5, color: 'var(--el-muted)', marginTop: 16 }}>
          Link này không còn ở trạng thái chờ thanh toán.
        </p>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '16px 0' }}>
          <Icon name="error" size={15} style={{ color: 'var(--el-danger)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--el-danger)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {canPay && (
          <Button onClick={pay} disabled={paying}>
            {paying ? 'Đang thanh toán…' : `Thanh toán ${formatVnd(link.amount)}`}
          </Button>
        )}
        <Button variant="ghost" onClick={onBack}>
          Về trang chủ
        </Button>
      </div>
    </Screen>
  );
}
