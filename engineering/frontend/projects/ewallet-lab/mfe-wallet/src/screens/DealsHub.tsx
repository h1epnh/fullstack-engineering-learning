import {
  type PassPackageDefinition,
  type VoucherDto,
  voucherPassService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, EmptyState, Icon, ProgressBar, Screen, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useMemo, useState } from 'react';

type DealCategory = 'ALL' | 'FOOD' | 'COFFEE' | 'MOVIE' | 'SUPERMARKET';

const CATEGORIES: { key: DealCategory; label: string; icon: string }[] = [
  { key: 'ALL', label: 'Tất cả', icon: 'apps' },
  { key: 'FOOD', label: 'Ăn uống', icon: 'restaurant' },
  { key: 'COFFEE', label: 'Cà phê', icon: 'local_cafe' },
  { key: 'MOVIE', label: 'Phim', icon: 'local_movies' },
  { key: 'SUPERMARKET', label: 'Siêu thị', icon: 'shopping_cart' },
];

interface FlashDeal {
  id: string;
  brand: string;
  title: string;
  discountNote: string;
  remainingSlots: number;
  category: DealCategory;
  costPoints: number;
  costVnd: number;
  routeKey: string;
}

const STATIC_FLASH_DEALS: FlashDeal[] = [
  {
    id: 'deal-highlands',
    brand: 'Highlands Coffee',
    title: 'Giảm 30.000đ cho đơn từ 69.000đ',
    discountNote: 'Áp dụng mọi chi nhánh toàn quốc',
    remainingSlots: 45,
    category: 'COFFEE',
    costPoints: 50,
    costVnd: 0,
    routeKey: 'qr-pay',
  },
  {
    id: 'deal-phuclong',
    brand: 'Phúc Long Tea & Coffee',
    title: 'Mua 1 tặng 1 Trà Đào Hồng Đài',
    discountNote: 'Áp dụng thứ 4 hàng tuần',
    remainingSlots: 28,
    category: 'COFFEE',
    costPoints: 0,
    costVnd: 0,
    routeKey: 'qr-pay',
  },
  {
    id: 'deal-cgv',
    brand: 'CGV Cinemas',
    title: 'Vé xem phim 2D đồng giá 79.000đ',
    discountNote: 'Tặng kèm 1 bắp ngọt khi quét QR',
    remainingSlots: 15,
    category: 'MOVIE',
    costPoints: 100,
    costVnd: 0,
    routeKey: 'bill-payment',
  },
  {
    id: 'deal-winmart',
    brand: 'WinMart / WinMart+',
    title: 'Giảm 40.000đ hoá đơn từ 200.000đ',
    discountNote: 'Áp dụng cho rau củ quả & thực phẩm tươi',
    remainingSlots: 50,
    category: 'SUPERMARKET',
    costPoints: 0,
    costVnd: 0,
    routeKey: 'qr-pay',
  },
  {
    id: 'deal-kfc',
    brand: 'KFC Vietnam',
    title: 'Combo gà giòn 2 miếng + Khoai chỉ 65.000đ',
    discountNote: 'Tiết kiệm 30.000đ so với giá gốc',
    remainingSlots: 32,
    category: 'FOOD',
    costPoints: 0,
    costVnd: 0,
    routeKey: 'qr-pay',
  },
];

export default function DealsHub({
  session,
  onBack,
  onNavigate,
}: {
  session: Session;
  onBack: () => void;
  onNavigate?: (routeKey: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<DealCategory>('ALL');
  const [passCatalog, setPassCatalog] = useState<PassPackageDefinition[] | null>(null);
  const [myVouchers, setMyVouchers] = useState<VoucherDto[]>([]);
  const [showMyVouchers, setShowMyVouchers] = useState(false);
  const [purchasingPassCode, setPurchasingPassCode] = useState<string | null>(null);
  const [collectedDealIds, setCollectedDealIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Countdown timer for flash deals (HH:MM:SS)
  const [timeLeft, setTimeLeft] = useState(9912); // seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 9912));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const loadData = () => {
    voucherPassService.getCatalog().then(setPassCatalog).catch(() => setPassCatalog([]));
    voucherPassService.getMyVouchers(session.id, 'AVAILABLE').then(setMyVouchers).catch(() => setMyVouchers([]));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCollectDeal = (deal: FlashDeal) => {
    setCollectedDealIds((prev) => new Set(prev).add(deal.id));
    showToast(`Đã thu thập voucher "${deal.brand}" thành công!`);
  };

  const handlePurchasePass = async (pass: PassPackageDefinition) => {
    setPurchasingPassCode(pass.code);
    try {
      await voucherPassService.purchasePass(session.id, pass.code);
      showToast(`Mua gói ${pass.name} thành công! Đã nạp voucher vào kho.`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Số dư ví không đủ để mua gói voucher.');
    } finally {
      setPurchasingPassCode(null);
    }
  };

  const filteredDeals = useMemo(() => {
    if (selectedCategory === 'ALL') return STATIC_FLASH_DEALS;
    return STATIC_FLASH_DEALS.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <Screen
      title="Săn Ưu Đãi & Cửa Hàng Thương Hiệu"
      subtitle="Flash Deals giờ vàng & Gói Voucher Pass tiết kiệm đến 70%"
      onBack={showMyVouchers ? () => setShowMyVouchers(false) : onBack}
    >
      {/* Toast alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header action: my vouchers */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -12, marginBottom: 12 }}>
        <button
          onClick={() => setShowMyVouchers(!showMyVouchers)}
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
          <Icon name={showMyVouchers ? 'arrow_back' : 'sell'} size={16} />
          {showMyVouchers ? 'Quay lại cửa hàng ưu đãi' : `Kho voucher của tôi (${myVouchers.length})`}
        </button>
      </div>

      {showMyVouchers ? (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Voucher khả dụng của bạn</h3>
          {myVouchers.length === 0 ? (
            <Card>
              <EmptyState icon="sell" text="Bạn chưa có voucher nào. Hãy thu thập deal hoặc mua gói Voucher Pass bên dưới!" />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myVouchers.map((v) => (
                <Card key={v.id} padding={14}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{v.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--el-muted)', margin: '2px 0 4px' }}>{v.description}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#389e0d' }}>
                      -{formatVnd(v.discountAmount)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--el-faint)', paddingTop: 6, borderTop: '1px solid var(--el-line)' }}>
                    <span>Hạn dùng: {new Date(v.expiresAt).toLocaleDateString('vi-VN')}</span>
                    <button
                      onClick={() => onNavigate && onNavigate('bill-payment')}
                      style={{
                        background: 'var(--el-accent)',
                        color: '#fff',
                        border: 0,
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Dùng ngay ➔
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 14, scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    border: '1.5px solid',
                    borderColor: isSelected ? 'var(--el-accent)' : 'var(--el-line)',
                    background: isSelected ? 'var(--el-accent-soft)' : 'var(--el-surface)',
                    color: isSelected ? 'var(--el-accent-ink)' : 'var(--el-ink)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flex: 'none',
                  }}
                >
                  <Icon name={cat.icon} size={16} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Flash Deals with Countdown */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 15 }}>⚡</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#d32f2f', textTransform: 'uppercase' }}>
                  Flash Deals Giờ Vàng
                </span>
              </div>
              <div
                style={{
                  background: '#ffebee',
                  color: '#d32f2f',
                  border: '1px solid #ffcdd2',
                  borderRadius: 12,
                  padding: '3px 8px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                ⏱️ {formatCountdown(timeLeft)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredDeals.map((deal) => {
                const collected = collectedDealIds.has(deal.id);
                return (
                  <Card key={deal.id} padding={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, paddingRight: 8 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--el-accent)', textTransform: 'uppercase' }}>
                          {deal.brand}
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--el-ink)', margin: '2px 0' }}>
                          {deal.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--el-muted)' }}>
                          {deal.discountNote} • Còn {deal.remainingSlots} lượt
                        </div>
                      </div>

                      <button
                        onClick={() => (collected ? onNavigate && onNavigate(deal.routeKey) : handleCollectDeal(deal))}
                        style={{
                          background: collected ? 'var(--el-surface)' : 'var(--el-accent)',
                          color: collected ? 'var(--el-accent-ink)' : '#fff',
                          border: collected ? '1.5px solid var(--el-accent)' : 0,
                          borderRadius: 8,
                          padding: '7px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: collected ? 'none' : '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {collected ? 'Dùng ngay ➔' : 'Thu thập ngay'}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Voucher Pass Savings Packages */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 15 }}>🎟️</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--el-ink)', textTransform: 'uppercase' }}>
                Gói Tiết Kiệm Voucher Pass (Tiết kiệm đến 70%)
              </span>
            </div>

            {passCatalog === null ? (
              <ProgressBar label="Đang tải gói Voucher Pass…" />
            ) : passCatalog.length === 0 ? (
              <Card>
                <EmptyState icon="sell" text="Chưa có gói Voucher Pass nào mở bán." />
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {passCatalog.map((pkg) => {
                  const totalFaceValue = pkg.voucherTemplates.reduce((sum, v) => sum + v.discountAmount, 0);
                  const isPurchasing = purchasingPassCode === pkg.code;

                  return (
                    <Card key={pkg.code} padding={14} style={{ border: '1.5px solid var(--el-line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--el-ink)' }}>{pkg.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--el-muted)', margin: '2px 0' }}>{pkg.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--el-faint)' }}>Hạn dùng: {pkg.validDays} ngày kể từ khi kích hoạt</div>
                        </div>
                        <span
                          style={{
                            background: '#e6f7ff',
                            color: '#096dd9',
                            border: '1px solid #91d5ff',
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          {pkg.voucherTemplates.length} VOUCHER
                        </span>
                      </div>

                      {/* Vouchers inside package preview */}
                      <div style={{ background: 'var(--el-line-subtle, #fafafa)', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
                        {pkg.voucherTemplates.map((t, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 11.5,
                              color: 'var(--el-muted)',
                              padding: '2px 0',
                            }}
                          >
                            <span>• {t.title}</span>
                            <strong style={{ color: '#389e0d' }}>-{formatVnd(t.discountAmount)}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Pricing & Buy Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--el-faint)', textDecoration: 'line-through' }}>
                            Giá gốc: {formatVnd(totalFaceValue)}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--el-accent)' }}>
                            Chỉ {formatVnd(pkg.price)}
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          loading={isPurchasing}
                          onClick={() => handlePurchasePass(pkg)}
                          style={{ width: 'auto', padding: '8px 18px' }}
                        >
                          Mua gói ngay
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}
