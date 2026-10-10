import {
  type InsurancePolicy,
  type InsuranceProduct,
  insuranceService,
} from '@ewallet-lab/api-client';
import { Button, Card, EmptyState, Icon, StatusPill, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

export function MicroInsurance({ userId }: { userId: string }) {
  const [view, setView] = useState<'buy' | 'my-policies'>('buy');
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [selectedProductCode, setSelectedProductCode] = useState<string>('MOTORCYCLE_TNDS');
  const [insuredName, setInsuredName] = useState('');
  const [insuredIdCard, setInsuredIdCard] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPolicy, setSuccessPolicy] = useState<InsurancePolicy | null>(null);

  const [myPolicies, setMyPolicies] = useState<InsurancePolicy[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);

  useEffect(() => {
    insuranceService
      .getProducts()
      .then((data) => {
        setProducts(data);
        if (data.length > 0) setSelectedProductCode(data[0].productCode);
      })
      .catch(() => {});
  }, []);

  function loadMyPolicies() {
    setPoliciesLoading(true);
    insuranceService
      .getPolicies(userId)
      .then(setMyPolicies)
      .catch(() => setMyPolicies([]))
      .finally(() => setPoliciesLoading(false));
  }

  useEffect(() => {
    if (view === 'my-policies') {
      loadMyPolicies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const activeProduct = products.find((p) => p.productCode === selectedProductCode);

  async function handleBuy() {
    if (!activeProduct) return;
    if (!insuredName.trim()) {
      setError('Vui lòng nhập họ tên người được bảo hiểm');
      return;
    }
    if (!insuredIdCard.trim()) {
      setError('Vui lòng nhập số CCCD/CMND');
      return;
    }
    if (activeProduct.requiresVehiclePlate && !vehiclePlate.trim()) {
      setError('Vui lòng nhập biển số xe máy');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const policy = await insuranceService.buyPolicy({
        userId,
        productCode: activeProduct.productCode,
        insuredName: insuredName.trim(),
        insuredIdCard: insuredIdCard.trim(),
        vehiclePlate: vehiclePlate.trim() || undefined,
      });
      setSuccessPolicy(policy);
    } catch (e: any) {
      setError(e.message || 'Thanh toán bảo hiểm thất bại');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Tabs: Mua bảo hiểm / Hợp đồng của tôi */}
      <div
        style={{
          display: 'flex',
          background: 'var(--el-surface-2)',
          borderRadius: 8,
          padding: 2,
        }}
      >
        <button
          onClick={() => {
            setView('buy');
            setSuccessPolicy(null);
          }}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: 6,
            border: 0,
            background: view === 'buy' ? 'var(--el-surface)' : 'none',
            color: view === 'buy' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: view === 'buy' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Mua bảo hiểm vi mô
        </button>
        <button
          onClick={() => setView('my-policies')}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: 6,
            border: 0,
            background: view === 'my-policies' ? 'var(--el-surface)' : 'none',
            color: view === 'my-policies' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: view === 'my-policies' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Chứng nhận của tôi
        </button>
      </div>

      {/* Mandatory learning disclaimer */}
      <div
        style={{
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          color: 'var(--el-ink)',
          lineHeight: 1.4,
        }}
      >
        <strong>Cảnh báo miễn trừ trách nhiệm:</strong> Sản phẩm bảo hiểm vi mô và Giấy chứng nhận điện tử hoàn toàn là MÔ PHỎNG cho mục đích học tập — KHÔNG có công ty bảo hiểm thật đứng sau và KHÔNG có giá trị pháp lý thay thế bảo hiểm thật khi tham gia giao thông.
      </div>

      {/* VIEW: MY POLICIES / E-CERTIFICATES */}
      {view === 'my-policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {policiesLoading ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--el-muted)' }}>
              Đang tải danh sách giấy chứng nhận...
            </div>
          ) : myPolicies.length === 0 ? (
            <EmptyState
              icon={<Icon name="info" size={32} />}
              title="Chưa có giấy chứng nhận bảo hiểm"
              description="Bạn chưa đăng ký mua gói bảo hiểm vi mô nào."
            />
          ) : (
            myPolicies.map((p) => (
              <Card
                key={p.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 16,
                  border: '2px solid rgba(234, 179, 8, 0.4)',
                  background: 'var(--el-surface)',
                  borderRadius: 12,
                }}
              >
                {/* Header certificate */}
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--el-border)', paddingBottom: 10 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🛡️</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--el-muted)' }}>
                    CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM (MÔ PHỎNG)
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--el-ink)', marginTop: 4 }}>
                    GIẤY CHỨNG NHẬN BẢO HIỂM ĐIỆN TỬ
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', marginTop: 2 }}>
                    Số: {p.certificateNumber}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--el-muted)' }}>Sản phẩm:</span>
                    <strong>{p.productName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--el-muted)' }}>Chủ xe / Người BH:</span>
                    <strong>{p.insuredName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--el-muted)' }}>Số CCCD:</span>
                    <span>{p.insuredIdCard}</span>
                  </div>
                  {p.vehiclePlate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--el-muted)' }}>Biển số xe:</span>
                      <strong style={{ color: '#2563eb' }}>{p.vehiclePlate}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--el-muted)' }}>Quyền lợi bảo hiểm:</span>
                    <strong style={{ color: 'var(--el-success)' }}>{formatVnd(p.coverageAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--el-muted)' }}>Thời hạn hiệu lực:</span>
                    <span>{formatDate(p.effectiveDate)} đến {formatDate(p.expiryDate)}</span>
                  </div>
                </div>

                {/* Simulated QR Code for CSGT verification */}
                <div
                  style={{
                    marginTop: 4,
                    padding: 8,
                    background: 'var(--el-surface-2)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: '#1e293b',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 2,
                      padding: 4,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#1e293b' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#1e293b' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#1e293b' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#1e293b' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#1e293b' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#fff' }} />
                    <div style={{ background: '#1e293b' }} />
                    <div style={{ background: '#fff' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--el-muted)', lineHeight: 1.3 }}>
                    <strong>Mã tra cứu điện tử</strong>
                    <div>Dùng để xuất trình tra cứu hiệu lực giấy chứng nhận</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusPill tone="success">Đang hiệu lực</StatusPill>
                  <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Phí: {formatVnd(p.premiumAmount)}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* VIEW: BUY INSURANCE FORM */}
      {view === 'buy' && !successPolicy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-muted)' }}>Chọn gói bảo hiểm vi mô</div>

          {/* Product Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map((p) => {
              const isSelected = p.productCode === selectedProductCode;
              return (
                <div
                  key={p.productCode}
                  onClick={() => setSelectedProductCode(p.productCode)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: isSelected ? '2px solid var(--el-brand, #2563eb)' : '1px solid var(--el-border)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'var(--el-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18 }}>{p.productCode === 'MOTORCYCLE_TNDS' ? '🛵' : '🛡️'}</span>
                      <strong style={{ fontSize: 14 }}>{p.name}</strong>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--el-brand, #2563eb)' }}>
                      {formatVnd(p.premiumAmount)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--el-muted)', lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--el-ink)', marginTop: 2 }}>
                    <span>Thời hạn: <strong>{p.durationText}</strong></span>
                    <span>Quyền lợi tối đa: <strong>{formatVnd(p.coverageAmount)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inputs */}
          {activeProduct && (
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Thông tin người được bảo hiểm</div>

              <TextField
                label="Họ và tên người được bảo hiểm *"
                value={insuredName}
                onChange={(e) => setInsuredName(e.target.value)}
                placeholder="Vd: Nguyễn Văn A"
              />

              <TextField
                label="Số CCCD / CMND *"
                value={insuredIdCard}
                onChange={(e) => setInsuredIdCard(e.target.value)}
                placeholder="Vd: 012345678901"
              />

              {activeProduct.requiresVehiclePlate && (
                <TextField
                  label="Biển số xe máy *"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="Vd: 29A1-123.45 hoặc 59X2-999.88"
                />
              )}

              <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>
                Phí bảo hiểm <strong>{formatVnd(activeProduct.premiumAmount)}</strong> sẽ được trừ trực tiếp từ Ví chính của bạn.
              </div>

              {error && <div style={{ color: 'var(--el-danger)', fontSize: 13 }}>{error}</div>}

              <Button variant="primary" onClick={handleBuy} disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Đang cấp chứng nhận...' : `Thanh toán ${formatVnd(activeProduct.premiumAmount)}`}
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* VIEW: BUY SUCCESS E-CERTIFICATE */}
      {view === 'buy' && successPolicy && (
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: 16,
            border: '2px solid rgba(34, 197, 94, 0.4)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🎉</div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--el-success)' }}>
              Cấp Giấy chứng nhận bảo hiểm thành công!
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--el-muted)' }}>
              Giấy chứng nhận điện tử có giá trị tra cứu đã được lưu vào danh mục của bạn.
            </p>
          </div>

          <div
            style={{
              background: 'var(--el-surface-2)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--el-muted)' }}>Mã chứng nhận:</span>
              <strong style={{ color: '#b45309', letterSpacing: 1 }}>{successPolicy.certificateNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--el-muted)' }}>Gói bảo hiểm:</span>
              <span>{successPolicy.productName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--el-muted)' }}>Người được BH:</span>
              <span>{successPolicy.insuredName}</span>
            </div>
            {successPolicy.vehiclePlate && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--el-muted)' }}>Biển số xe:</span>
                <strong>{successPolicy.vehiclePlate}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--el-muted)' }}>Quyền lợi tối đa:</span>
              <strong style={{ color: 'var(--el-success)' }}>{formatVnd(successPolicy.coverageAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--el-muted)' }}>Hiệu lực:</span>
              <span>{formatDate(successPolicy.effectiveDate)} đến {formatDate(successPolicy.expiryDate)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setSuccessPolicy(null);
                setInsuredName('');
                setInsuredIdCard('');
                setVehiclePlate('');
              }}
              style={{ flex: 1 }}
            >
              Mua gói khác
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSuccessPolicy(null);
                setView('my-policies');
              }}
              style={{ flex: 1 }}
            >
              Xem chứng nhận
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
