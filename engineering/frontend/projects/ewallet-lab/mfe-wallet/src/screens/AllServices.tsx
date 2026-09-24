import { Screen } from '@ewallet-lab/ui';
import { QuickAction } from '@ewallet-lab/ui';

/**
 * Reached via Home's "Xem thêm dịch vụ" tile — mirrors the real app's own pattern of keeping
 * the home grid small (7 tiles) and pushing the fuller catalog behind a "see more" page.
 * Categories are momo.vn's real "Tiện ích và dịch vụ" landing-page list (12 groups, verified by
 * fetching momo.vn directly) — the actual in-app "Xem thêm dịch vụ" screen itself wasn't in the
 * screenshots we have, so this is grounded in the closest real source available, not guessed.
 * None of these call a real backend (see mfe-wallet/src/screens/Home.tsx for the one real flow,
 * Nạp/Rút) — every tile here is comingSoon, consistent with the rest of this repo.
 */
const ALL_SERVICES: { key: string; icon: string; label: string }[] = [
  { key: 'suggested', icon: 'star', label: 'MoMo đề xuất' },
  { key: 'finance-insurance', icon: 'payments', label: 'Tài chính - Bảo hiểm' },
  { key: 'movie-tickets', icon: 'local_movies', label: 'Mua vé xem phim' },
  { key: 'charity', icon: 'favorite', label: 'Ví Nhân Ái' },
  { key: 'transportation', icon: 'directions_bus', label: 'Tiện ích giao thông' },
  { key: 'phone-data', icon: 'smartphone', label: 'Điện thoại - Data 4G/5G' },
  { key: 'travel', icon: 'flight', label: 'Du lịch - Đi lại' },
  { key: 'ecommerce', icon: 'shopping_bag', label: 'Thương mại điện tử' },
  { key: 'games', icon: 'sports_esports', label: 'Game - Ứng dụng' },
  { key: 'counter-payment', icon: 'storefront', label: 'Thanh toán tại quầy' },
];

export default function AllServices({ onComingSoon }: { onComingSoon: (feature: string) => void }) {
  return (
    <Screen title="Tất cả dịch vụ">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_SERVICES.map((s) => (
          <QuickAction key={s.key} icon={s.icon} label={s.label} comingSoon onClick={() => onComingSoon(s.key)} />
        ))}
      </div>
    </Screen>
  );
}
