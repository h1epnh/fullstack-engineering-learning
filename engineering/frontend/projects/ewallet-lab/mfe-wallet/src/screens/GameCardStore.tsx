import {
  type GameCardOrder,
  type GamePublisher,
  gameCardService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, EmptyState, Icon, ProgressBar, Screen, StepUpModal, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PUBLISHERS: {
  key: GamePublisher;
  name: string;
  desc: string;
  icon: string;
  color: string;
}[] = [
  { key: 'GARENA', name: 'Garena', desc: 'Liên Quân, Free Fire, FC Online', icon: 'sports_esports', color: '#e53935' },
  { key: 'ZING', name: 'Zing Card', desc: 'VNGGames, PUBG Mobile, Valorant', icon: 'gamepad', color: '#1e88e5' },
  { key: 'VCOIN', name: 'Vcoin', desc: 'VTC Game, Audition, Đột Kích', icon: 'token', color: '#fb8c00' },
  { key: 'GATE', name: 'Gate', desc: 'Thẻ game FPT Online', icon: 'local_fire_department', color: '#d32f2f' },
  { key: 'FUNCARD', name: 'Funcard', desc: 'Nạp game Funtap', icon: 'stars', color: '#8e24aa' },
  { key: 'APPOTA', name: 'Appota Card', desc: 'Nạp game Gamota', icon: 'bolt', color: '#fdd835' },
  { key: 'GOOGLE_PLAY', name: 'Google Play', desc: 'Nạp số dư CH Play Android', icon: 'shop', color: '#43a047' },
];

const DENOMINATIONS = [20000, 50000, 100000, 200000, 500000];

export default function GameCardStore({
  session,
  onBack,
  onNavigate,
}: {
  session: Session;
  onBack: () => void;
  onNavigate?: (routeKey: string) => void;
}) {
  const [selectedPublisher, setSelectedPublisher] = useState<GamePublisher>('GARENA');
  const [selectedDenom, setSelectedDenom] = useState<number>(100000);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepUpMsg, setStepUpMsg] = useState<string | null>(null);

  // Result state
  const [purchasedCard, setPurchasedCard] = useState<GameCardOrder | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [historyOrders, setHistoryOrders] = useState<GameCardOrder[] | null>(null);

  useEffect(() => {
    walletService.getBalance(session.id).then((b) => setWalletBalance(b.balance)).catch(() => {});
  }, [session.id]);

  const discountRate = 0.03; // 3%
  const finalPrice = Math.round(selectedDenom * (1 - discountRate));
  const savings = selectedDenom - finalPrice;

  async function handleBuy(stepUpConfirmed = false) {
    setError(null);
    setLoading(true);
    try {
      const order = await gameCardService.purchase({
        userId: session.id,
        publisher: selectedPublisher,
        denomination: selectedDenom,
        stepUpConfirmed,
      });
      setPurchasedCard(order);
      setStepUpMsg(null);
      // update wallet balance
      walletService.getBalance(session.id).then((b) => setWalletBalance(b.balance)).catch(() => {});
    } catch (err: any) {
      if (err.status === 428) {
        setStepUpMsg(err.message || 'Xác thực bổ sung để tiếp tục giao dịch');
      } else {
        setError(err.message || 'Mua thẻ thất bại. Vui lòng kiểm tra số dư và thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  }

  function loadHistory() {
    setShowHistory(true);
    gameCardService.getOrders(session.id).then(setHistoryOrders).catch(() => setHistoryOrders([]));
  }

  return (
    <Screen
      title="Mua Thẻ Game & Giải Trí"
      subtitle="Nạp thẻ game chính hãng chiết khấu 3% tức thì"
      onBack={showHistory ? () => setShowHistory(false) : onBack}
    >
      {/* Header action: history */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -12, marginBottom: 12 }}>
        <button
          onClick={showHistory ? () => setShowHistory(false) : loadHistory}
          style={{
            background: 'none',
            border: 0,
            color: 'var(--el-accent)',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name={showHistory ? 'arrow_back' : 'history'} size={16} />
          {showHistory ? 'Quay lại cửa hàng' : 'Lịch sử thẻ đã mua'}
        </button>
      </div>

      {showHistory ? (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Lịch sử thẻ game đã mua</h3>
          {historyOrders === null ? (
            <ProgressBar label="Đang tải lịch sử thẻ…" />
          ) : historyOrders.length === 0 ? (
            <Card>
              <EmptyState icon="sports_esports" text="Bạn chưa mua thẻ game nào." />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {historyOrders.map((order) => (
                <Card key={order.id} padding={12}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{order.publisherName}</span>
                    <span style={{ fontWeight: 700, color: 'var(--el-accent)' }}>{formatVnd(order.denomination)}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--el-faint)', marginBottom: 8 }}>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>

                  <div style={{ background: 'var(--el-line-subtle, #f5f5f5)', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span>Mã PIN: <strong>{order.pinCode}</strong></span>
                      <button
                        onClick={() => handleCopy(order.pinCode.replace(/\s+/g, ''), `hist-pin-${order.id}`)}
                        style={{ border: 0, background: 'none', color: 'var(--el-accent)', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}
                      >
                        {copiedKey === `hist-pin-${order.id}` ? 'Đã chép!' : 'Chép'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Serial: <strong>{order.serialNumber}</strong></span>
                      <button
                        onClick={() => handleCopy(order.serialNumber.replace(/\s+/g, ''), `hist-ser-${order.id}`)}
                        style={{ border: 0, background: 'none', color: 'var(--el-accent)', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}
                      >
                        {copiedKey === `hist-ser-${order.id}` ? 'Đã chép!' : 'Chép'}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : purchasedCard ? (
        /* Result Screen: Card Purchased Successfully */
        <div>
          <Card
            style={{
              textAlign: 'center',
              border: '1.5px solid #52c41a',
              background: '#f6ffed',
              marginBottom: 16,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#52c41a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
              <Icon name="check" size={28} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#274916' }}>
              MUA THẺ GAME THÀNH CÔNG!
            </h2>
            <div style={{ fontSize: 13, color: '#389e0d', fontWeight: 600 }}>
              {purchasedCard.publisherName} • Mệnh giá {formatVnd(purchasedCard.denomination)}
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 4 }}>Mã PIN (Mã Nạp Thẻ):</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--el-line-subtle, #f5f5f5)', padding: '10px 12px', borderRadius: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>
                    {purchasedCard.pinCode}
                  </span>
                  <button
                    onClick={() => handleCopy(purchasedCard.pinCode.replace(/\s+/g, ''), 'pin')}
                    style={{
                      border: '1px solid var(--el-line)',
                      background: 'var(--el-surface)',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: copiedKey === 'pin' ? '#52c41a' : 'var(--el-ink)',
                    }}
                  >
                    {copiedKey === 'pin' ? '✓ Đã chép!' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--el-muted)', marginBottom: 4 }}>Số Serial:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--el-line-subtle, #f5f5f5)', padding: '10px 12px', borderRadius: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
                    {purchasedCard.serialNumber}
                  </span>
                  <button
                    onClick={() => handleCopy(purchasedCard.serialNumber.replace(/\s+/g, ''), 'serial')}
                    style={{
                      border: '1px solid var(--el-line)',
                      background: 'var(--el-surface)',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: copiedKey === 'serial' ? '#52c41a' : 'var(--el-ink)',
                    }}
                  >
                    {copiedKey === 'serial' ? '✓ Đã chép!' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--el-faint)', paddingTop: 4 }}>
                <span>Hạn sử dụng: {purchasedCard.expiryDate}</span>
                <span>Thanh toán: {formatVnd(purchasedCard.finalPrice)}</span>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button
              variant="secondary"
              onClick={() =>
                handleCopy(
                  `Mã PIN: ${purchasedCard.pinCode.replace(/\s+/g, '')} - Serial: ${purchasedCard.serialNumber.replace(/\s+/g, '')}`,
                  'both',
                )
              }
            >
              {copiedKey === 'both' ? '✓ Đã sao chép cả PIN & Serial!' : 'Sao chép cả PIN & Serial 1 chạm'}
            </Button>
            <Button variant="primary" onClick={() => setPurchasedCard(null)}>
              Tiếp tục mua thẻ khác
            </Button>
          </div>
        </div>
      ) : (
        /* Purchase Form */
        <div>
          {/* 1. Publishers List */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--el-faint)', textTransform: 'uppercase', marginBottom: 8 }}>
              1. Chọn Nhà Phát Hành Game
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PUBLISHERS.map((pub) => {
                const isSelected = selectedPublisher === pub.key;
                return (
                  <button
                    key={pub.key}
                    onClick={() => setSelectedPublisher(pub.key)}
                    style={{
                      flex: '1 0 30%',
                      minWidth: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '10px 6px',
                      borderRadius: 12,
                      border: '1.5px solid',
                      borderColor: isSelected ? 'var(--el-accent)' : 'var(--el-line)',
                      background: isSelected ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <Icon name={pub.icon} size={22} style={{ color: pub.color }} />
                    <span style={{ fontSize: 12.5, fontWeight: isSelected ? 800 : 600, color: 'var(--el-ink)' }}>
                      {pub.name}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--el-muted)', textAlign: 'center', lineHeight: 1.1 }}>
                      {pub.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Denominations */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--el-faint)', textTransform: 'uppercase', marginBottom: 8 }}>
              2. Chọn Mệnh Giá Thẻ
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DENOMINATIONS.map((denom) => {
                const isSelected = selectedDenom === denom;
                const price = Math.round(denom * (1 - discountRate));
                const isPopular = denom === 100000;

                return (
                  <button
                    key={denom}
                    onClick={() => setSelectedDenom(denom)}
                    style={{
                      flex: '1 0 45%',
                      minWidth: 140,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid',
                      borderColor: isSelected ? 'var(--el-accent)' : 'var(--el-line)',
                      background: isSelected ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    {isPopular && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: 8,
                          background: 'var(--el-danger)',
                          color: '#fff',
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 6,
                        }}
                      >
                        PHỔ BIẾN
                      </span>
                    )}
                    <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--el-ink)', marginBottom: 2 }}>
                      {formatVnd(denom)}
                    </span>
                    <div style={{ fontSize: 12, color: 'var(--el-accent-ink)', fontWeight: 600 }}>
                      Giá: {formatVnd(price)} <span style={{ color: '#d32f2f' }}>(-3%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Summary & Payment */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--el-muted)', marginBottom: 6 }}>
              <span>Nguồn tiền:</span>
              <span style={{ fontWeight: 600, color: 'var(--el-ink)' }}>
                Ví chính ({walletBalance != null ? formatVnd(walletBalance) : '…'})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--el-muted)', marginBottom: 6 }}>
              <span>Mệnh giá niêm yết:</span>
              <span>{formatVnd(selectedDenom)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#389e0d', marginBottom: 10 }}>
              <span>Chiết khấu trực tiếp (3%):</span>
              <span>- {formatVnd(savings)}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--el-line)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Tổng thanh toán:</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--el-accent)' }}>
                {formatVnd(finalPrice)}
              </span>
            </div>
          </Card>

          {error && (
            <div
              style={{
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                color: '#cf1322',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12.5,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <Button
            variant="primary"
            loading={loading}
            disabled={walletBalance != null && walletBalance < finalPrice}
            onClick={() => handleBuy(false)}
          >
            {walletBalance != null && walletBalance < finalPrice
              ? 'Số dư ví không đủ'
              : `MUA NGAY • ${formatVnd(finalPrice)} (-3%)`}
          </Button>

          {stepUpMsg && (
            <StepUpModal
              message={stepUpMsg}
              onConfirm={() => handleBuy(true)}
              onCancel={() => setStepUpMsg(null)}
            />
          )}
        </div>
      )}
    </Screen>
  );
}
