import {
  ApiError,
  STEP_UP_REQUIRED_STATUS,
  type DigitalServicePackage,
  type DigitalSubscriptionOrder,
  digitalService,
} from '@ewallet-lab/api-client';
import { Button, Card, EmptyState, Icon, StatusPill, StepUpModal, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

export function DigitalServices({
  userId,
}: {
  userId: string;
}) {
  const [packages, setPackages] = useState<DigitalServicePackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<DigitalServicePackage | null>(null);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<DigitalSubscriptionOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<DigitalSubscriptionOrder[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Step-up modal state (QĐ 2345/QĐ-NHNN)
  const [stepUpMessage, setStepUpMessage] = useState<string | null>(null);

  useEffect(() => {
    digitalService
      .getCatalog()
      .then((data) => {
        setPackages(data);
        if (data.length > 0) setSelectedPkg(data[0]);
      })
      .catch((e) => setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'bill-payment')));
  }, []);

  function loadHistory() {
    digitalService
      .getHistory(userId)
      .then(setHistory)
      .catch(() => {});
  }

  useEffect(() => {
    if (showHistory) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHistory, userId]);

  async function handleSubscribe(stepUpConfirmed = false) {
    if (!selectedPkg || !accountIdentifier.trim()) {
      setError('Vui lòng nhập tài khoản hoặc email nhận dịch vụ');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const order = await digitalService.subscribe({
        userId,
        packageCode: selectedPkg.packageCode,
        accountIdentifier: accountIdentifier.trim(),
        stepUpConfirmed,
      });
      setSuccessOrder(order);
      setStepUpMessage(null);
      loadHistory();
    } catch (e) {
      if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
        setStepUpMessage(e.message);
        return;
      }
      setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'bill-payment'));
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Mandatory Lab Disclaimer Banner */}
      <div
        style={{
          background: 'var(--el-accent-soft)',
          border: '1px solid var(--el-accent)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12.5,
          color: 'var(--el-ink)',
          lineHeight: 1.45,
        }}
      >
        <strong>Mô phỏng Lab học tập:</strong> Dịch vụ số & giải trí (Spotify, Netflix, VieON, App Store) được mô phỏng
        trong môi trường lab học tập — không có quan hệ thương mại thực tế với các nhà cung cấp.
      </div>

      {/* Sub-view toggle: Đăng ký mới vs Lịch sử */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => {
            setShowHistory(false);
            setSuccessOrder(null);
          }}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: !showHistory ? 'var(--el-surface-2)' : 'transparent',
            color: !showHistory ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: !showHistory ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Mua gói dịch vụ
        </button>
        <button
          onClick={() => setShowHistory(true)}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 0,
            background: showHistory ? 'var(--el-surface-2)' : 'transparent',
            color: showHistory ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: showHistory ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Mã đã mua & Lịch sử
        </button>
      </div>

      {showHistory ? (
        <div>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Mã kích hoạt & Đăng ký của bạn</h4>
          {history.length === 0 ? (
            <EmptyState title="Chưa có mã kích hoạt nào" description="Bạn chưa mua gói dịch vụ số hoặc giải trí nào." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((item) => (
                <Card key={item.id} padding="12px 14px">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong>{item.packageName}</strong>
                    <StatusPill tone="positive" label={item.status} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--el-muted)', marginBottom: 6 }}>
                    Tài khoản: {item.accountIdentifier} • {formatVnd(item.price)}
                  </div>
                  <div
                    style={{
                      background: 'var(--el-surface-2)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1.2 }}>
                      {item.activationCode}
                    </span>
                    <button
                      onClick={() => handleCopy(item.activationCode)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--el-line)',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Sao chép
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : successOrder ? (
        /* Order Receipt Screen */
        <Card padding="20px">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <h3 style={{ margin: '0 0 4px' }}>Thanh toán thành công!</h3>
            <p style={{ margin: 0, color: 'var(--el-muted)', fontSize: 13 }}>
              Mã kích hoạt dịch vụ số của bạn đã sẵn sàng
            </p>
          </div>

          <div style={{ background: 'var(--el-surface-2)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 4 }}>Gói dịch vụ</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{successOrder.packageName}</div>

            <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 4 }}>Mã kích hoạt (Activation Code)</div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
                color: 'var(--el-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--el-surface)',
                borderRadius: 6,
                border: '1px dashed var(--el-accent)',
              }}
            >
              <span>{successOrder.activationCode}</span>
              <button
                onClick={() => handleCopy(successOrder.activationCode)}
                style={{
                  background: 'var(--el-accent)',
                  color: '#fff',
                  border: 0,
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {copied ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--el-muted)' }}>
              Tài khoản nhận: <strong>{successOrder.accountIdentifier}</strong> • Số tiền:{' '}
              <strong>{formatVnd(successOrder.price)}</strong>
            </div>
          </div>

          <Button
            tone="primary"
            fullWidth
            onClick={() => {
              setSuccessOrder(null);
              setAccountIdentifier('');
            }}
          >
            Mua thêm gói khác
          </Button>
        </Card>
      ) : (
        /* Package Selection & Purchase Screen */
        <div>
          <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Chọn gói dịch vụ số</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {packages.map((pkg) => {
              const isSelected = selectedPkg?.packageCode === pkg.packageCode;
              return (
                <div
                  key={pkg.packageCode}
                  onClick={() => setSelectedPkg(pkg)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? 'var(--el-accent)' : 'var(--el-line)'}`,
                    background: isSelected ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--el-ink)' }}>{pkg.packageName}</div>
                    <div style={{ fontSize: 12, color: 'var(--el-muted)', marginTop: 2 }}>
                      {pkg.serviceName} • {pkg.duration}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--el-ink)' }}>
                      {formatVnd(pkg.price)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPkg && (
            <Card padding="14px" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <TextField
                  label="Email / Số điện thoại tài khoản nhận mã"
                  placeholder="Nhập email tài khoản cần nạp/gia hạn"
                  value={accountIdentifier}
                  onChange={(e) => setAccountIdentifier(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 8,
                  borderTop: '1px solid var(--el-line)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--el-muted)' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--el-ink)' }}>
                  {formatVnd(selectedPkg.price)}
                </span>
              </div>
            </Card>
          )}

          {error && (
            <p style={{ color: 'var(--el-danger)', fontSize: 13, margin: '0 0 12px' }}>{error}</p>
          )}

          <Button
            tone="primary"
            fullWidth
            loading={loading}
            disabled={!selectedPkg || !accountIdentifier.trim() || loading}
            onClick={() => handleSubscribe(false)}
          >
            Thanh toán & Nhận mã kích hoạt
          </Button>
        </div>
      )}

      {/* Step-up Authentication Modal if required */}
      {stepUpMessage && (
        <StepUpModal
          message={stepUpMessage}
          onConfirm={() => handleSubscribe(true)}
          onCancel={() => setStepUpMessage(null)}
        />
      )}
    </div>
  );
}
