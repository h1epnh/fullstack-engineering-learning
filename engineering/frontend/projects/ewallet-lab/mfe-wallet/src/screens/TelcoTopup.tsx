import {
  type TelcoOrder,
  type TelcoPackage,
  type TelcoProvider,
  telcoService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Icon, Screen, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PROVIDERS: { id: TelcoProvider; name: string; color: string }[] = [
  { id: 'VIETTEL', name: 'Viettel', color: '#ee0033' },
  { id: 'VINAPHONE', name: 'VinaPhone', color: '#0085d0' },
  { id: 'MOBIFONE', name: 'MobiFone', color: '#005baa' },
];

const DENOMINATIONS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function TelcoTopup({ session, onBack }: { session: Session; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'DIRECT_TOPUP' | 'CARD_PIN' | 'HISTORY'>('DIRECT_TOPUP');
  const [selectedProvider, setSelectedProvider] = useState<TelcoProvider>('VIETTEL');
  const [selectedDenom, setSelectedDenom] = useState<number>(50000);
  const [phoneNumber, setPhoneNumber] = useState<string>(session.phone || '');
  const [packages, setPackages] = useState<TelcoPackage[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<TelcoOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentOrder, setRecentOrder] = useState<TelcoOrder | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    telcoService.getPackages().then(setPackages).catch(() => {});
    walletService.getBalance(session.id).then((b) => setWalletBalance(b.balance)).catch(() => {});
  }, [session.id]);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = () => {
    telcoService.getOrders(session.id).then(setHistory).catch(() => {});
  };

  const currentPkg = packages.find(
    (p) => p.provider === selectedProvider && p.denomination === selectedDenom
  );
  const discountRate = currentPkg ? currentPkg.discountRate : selectedProvider === 'VIETTEL' ? 0.02 : 0.025;
  const finalPrice = currentPkg
    ? currentPkg.finalPrice
    : Math.round(selectedDenom * (1 - discountRate));

  const handlePurchase = async () => {
    setErrorMsg(null);
    if (activeTab === 'DIRECT_TOPUP') {
      const cleanPhone = phoneNumber.trim();
      if (!/^0[35789]\d{8}$/.test(cleanPhone)) {
        setErrorMsg('Vui lòng nhập số điện thoại di động hợp lệ (10 chữ số, đầu 03/05/07/08/09)');
        return;
      }
    }

    setLoading(true);
    try {
      const order = await telcoService.createOrder({
        userId: session.id,
        telcoProvider: selectedProvider,
        orderType: activeTab === 'DIRECT_TOPUP' ? 'DIRECT_TOPUP' : 'CARD_PIN',
        denomination: selectedDenom,
        phoneNumber: activeTab === 'DIRECT_TOPUP' ? phoneNumber.trim() : undefined,
      });

      setRecentOrder(order);
      // Reload balance
      const bal = await walletService.getBalance(session.id);
      setWalletBalance(bal.balance);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Giao dịch không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Screen
      title="Nạp ĐT & Thẻ Cào"
      subtitle="Chiết khấu đến 2.5% · Nhận thẻ tức thì"
      onBack={onBack}
    >
      {/* Wallet Balance Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '10px 14px', background: '#f5f5f7', borderRadius: 10 }}>
        <span style={{ fontSize: 13, color: '#666' }}>Số dư ví khả dụng:</span>
        <strong style={{ fontSize: 15, color: '#1a1a1a' }}>
          {walletBalance !== null ? formatVnd(walletBalance) : '...'}
        </strong>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => { setActiveTab('DIRECT_TOPUP'); setRecentOrder(null); setErrorMsg(null); }}
          style={{
            padding: '10px 4px',
            borderRadius: 8,
            border: activeTab === 'DIRECT_TOPUP' ? '2px solid #a50064' : '1px solid #ddd',
            background: activeTab === 'DIRECT_TOPUP' ? '#fdf0f6' : '#fff',
            color: activeTab === 'DIRECT_TOPUP' ? '#a50064' : '#333',
            fontWeight: activeTab === 'DIRECT_TOPUP' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Nạp trực tiếp
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('CARD_PIN'); setRecentOrder(null); setErrorMsg(null); }}
          style={{
            padding: '10px 4px',
            borderRadius: 8,
            border: activeTab === 'CARD_PIN' ? '2px solid #a50064' : '1px solid #ddd',
            background: activeTab === 'CARD_PIN' ? '#fdf0f6' : '#fff',
            color: activeTab === 'CARD_PIN' ? '#a50064' : '#333',
            fontWeight: activeTab === 'CARD_PIN' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Mua mã thẻ
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('HISTORY'); setRecentOrder(null); setErrorMsg(null); }}
          style={{
            padding: '10px 4px',
            borderRadius: 8,
            border: activeTab === 'HISTORY' ? '2px solid #a50064' : '1px solid #ddd',
            background: activeTab === 'HISTORY' ? '#fdf0f6' : '#fff',
            color: activeTab === 'HISTORY' ? '#a50064' : '#333',
            fontWeight: activeTab === 'HISTORY' ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Kho thẻ / Lịch sử
        </button>
      </div>

      {recentOrder ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: recentOrder.status === 'COMPLETED' ? '#e6f7ed' : '#feecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Icon
                name={recentOrder.status === 'COMPLETED' ? 'check_circle' : 'error'}
                style={{ fontSize: 32, color: recentOrder.status === 'COMPLETED' ? '#00a854' : '#f5222d' }}
              />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>
              {recentOrder.status === 'COMPLETED' ? 'Giao dịch thành công!' : 'Giao dịch thất bại (Đã hoàn tiền)'}
            </h3>
            <p style={{ margin: '0 0 16px', color: '#666', fontSize: 13 }}>
              {recentOrder.orderType === 'DIRECT_TOPUP'
                ? `Nạp điện thoại ${recentOrder.telcoProvider} cho số ${recentOrder.phoneNumber}`
                : `Mã thẻ cào ${recentOrder.telcoProvider} ${formatVnd(recentOrder.denomination)}`}
            </p>

            {recentOrder.orderType === 'CARD_PIN' && recentOrder.status === 'COMPLETED' && (
              <div style={{ background: '#fafafa', border: '1px dashed #ccc', borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Số Seri:</span>
                  <code style={{ fontSize: 14, fontWeight: 'bold' }}>{recentOrder.serialNumber}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#666' }}>Mã PIN:</span>
                    <div style={{ fontSize: 17, fontWeight: 'bold', color: '#a50064', letterSpacing: 1 }}>
                      {recentOrder.pinCode}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => copyToClipboard(recentOrder.pinCode || '', recentOrder.id)}
                  >
                    {copiedId === recentOrder.id ? 'Đã chép!' : 'Sao chép PIN'}
                  </Button>
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                  Cú pháp nạp: Gọi <code>*100*{recentOrder.pinCode}#</code>
                </div>
              </div>
            )}

            {recentOrder.status === 'FAILED_REFUNDED' && (
              <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: '#cf1322' }}>
                <strong>Lý do:</strong> {recentOrder.failureReason}<br />
                <em>Số tiền {formatVnd(recentOrder.finalPrice)} đã được tự động hoàn trả nguyên vẹn về ví chính.</em>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setRecentOrder(null)} style={{ flex: 1 }}>
                Mua tiếp
              </Button>
              <Button onClick={() => setActiveTab('HISTORY')} style={{ flex: 1 }}>
                Xem lịch sử
              </Button>
            </div>
          </div>
        </Card>
      ) : activeTab === 'HISTORY' ? (
        <div>
          {history.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                Chưa có giao dịch viễn thông nào
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((order) => (
                <Card key={order.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>
                        {order.orderType === 'DIRECT_TOPUP' ? 'Nạp ĐT ' : 'Mã thẻ '}
                        {order.telcoProvider} {formatVnd(order.denomination)}
                      </strong>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {order.orderType === 'DIRECT_TOPUP' ? `SĐT: ${order.phoneNumber}` : `Seri: ${order.serialNumber || '—'}`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: order.status === 'COMPLETED' ? '#e6f7ed' : '#feecef',
                      color: order.status === 'COMPLETED' ? '#00a854' : '#f5222d',
                      fontWeight: 600,
                    }}>
                      {order.status === 'COMPLETED' ? 'Thành công' : 'Đã hoàn tiền'}
                    </span>
                  </div>

                  {order.orderType === 'CARD_PIN' && order.status === 'COMPLETED' && order.pinCode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f7', padding: '6px 10px', borderRadius: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
                        PIN: {order.pinCode}
                      </span>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => copyToClipboard(order.pinCode || '', order.id)}
                      >
                        {copiedId === order.id ? 'Đã chép' : 'Sao chép'}
                      </Button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#888' }}>
                    <span>Thanh toán: {formatVnd(order.finalPrice)} (-{(order.discountRate * 100).toFixed(1)}%)</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* SĐT Input if DIRECT_TOPUP */}
          {activeTab === 'DIRECT_TOPUP' && (
            <Card style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Số điện thoại nạp
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    fontSize: 15,
                  }}
                />
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setPhoneNumber(session.phone || '')}
                >
                  Số của tôi
                </Button>
              </div>
            </Card>
          )}

          {/* Provider Selection */}
          <Card style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Chọn nhà mạng
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {PROVIDERS.map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSelectedProvider(prov.id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 8,
                    border: selectedProvider === prov.id ? `2px solid ${prov.color}` : '1px solid #e0e0e0',
                    background: selectedProvider === prov.id ? '#fafafa' : '#fff',
                    fontWeight: selectedProvider === prov.id ? 700 : 500,
                    color: selectedProvider === prov.id ? prov.color : '#333',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{prov.name}</span>
                  <span style={{ fontSize: 10, color: '#00a854' }}>
                    Giảm {prov.id === 'VIETTEL' ? '2.0%' : '2.5%'}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Denomination Grid */}
          <Card style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Chọn mệnh giá
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {DENOMINATIONS.map((denom) => {
                const pkg = packages.find(
                  (p) => p.provider === selectedProvider && p.denomination === denom
                );
                const price = pkg ? pkg.finalPrice : Math.round(denom * (1 - discountRate));
                return (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => setSelectedDenom(denom)}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 8,
                      border: selectedDenom === denom ? '2px solid #a50064' : '1px solid #e0e0e0',
                      background: selectedDenom === denom ? '#fdf0f6' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: selectedDenom === denom ? '#a50064' : '#1a1a1a' }}>
                      {formatVnd(denom)}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                      Giá: {formatVnd(price)}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Pricing Summary */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#666' }}>
              <span>Mệnh giá nạp:</span>
              <span>{formatVnd(selectedDenom)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#00a854' }}>
              <span>Chiết khấu ({(discountRate * 100).toFixed(1)}%):</span>
              <span>-{formatVnd(selectedDenom - finalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #eee', fontSize: 16, fontWeight: 700 }}>
              <span>Số tiền thanh toán:</span>
              <span style={{ color: '#a50064' }}>{formatVnd(finalPrice)}</span>
            </div>
          </Card>

          {errorMsg && (
            <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: '#cf1322' }}>
              {errorMsg}
            </div>
          )}

          <Button
            onClick={handlePurchase}
            disabled={loading}
            style={{ width: '100%', height: 46, fontSize: 16 }}
          >
            {loading ? 'Đang xử lý…' : activeTab === 'DIRECT_TOPUP' ? `Nạp ngay ${formatVnd(finalPrice)}` : `Mua mã thẻ ${formatVnd(finalPrice)}`}
          </Button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 12 }}>
            Mô phỏng nạp tiền & mua mã thẻ trong môi trường ewallet-lab. Thẻ cào và số dư ví bảo mật tuyệt đối.
          </p>
        </div>
      )}
    </Screen>
  );
}
