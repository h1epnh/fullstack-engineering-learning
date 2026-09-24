import { Button, Icon, Screen } from '@ewallet-lab/ui';

/**
 * Copy for the remaining "chưa làm thật" tiles in the momo.vn-derived category grid (see
 * mfe-wallet/src/screens/Home.tsx MAIN_GRID/QUICK_ROW/FEED_TEASERS) — `transfer` and
 * `bill-payment` are now wired to real backends (transfer-service, bill-payment-service), and
 * `payment-link` (#3)/`payment-reminder` (#8) are now wired to payment-request-service, and
 * `lucky-money` (#10) is now wired to lucky-money-service (see mfe-transfer/src/App.tsx's
 * onComingSoon wrapper) — none of these 5 have an entry here anymore. Each remaining note is
 * honest about why, not a placeholder pretending a spec exists.
 */
const COPY: Record<string, { icon: string; title: string; body: string }> = {
  suggested: {
    icon: 'star',
    title: 'MoMo đề xuất',
    body: 'Trên momo.vn đây là nội dung cá nhân hoá theo hành vi người dùng, không phải một service cụ thể — không có backend tương ứng để xây trong lab này.',
  },
  'finance-insurance': {
    icon: 'payments',
    title: 'Tài chính - Bảo hiểm',
    body: 'Nhóm sản phẩm tài chính/bảo hiểm thật của MoMo hợp tác với bên thứ 3 (bảo hiểm, cho vay, tích luỹ) — ngoài phạm vi 1 lab học tập.',
  },
  'phone-data': {
    icon: 'smartphone',
    title: 'Điện thoại - Data 4G/5G',
    body: 'Nạp tiền điện thoại/data cần tích hợp trực tiếp với nhà mạng — chưa có mock-telco-gateway tương tự mock-bank-gateway.',
  },
  'movie-tickets': {
    icon: 'local_movies',
    title: 'Mua vé xem phim',
    body: 'Cần tích hợp rạp/CGV-Lotte-style booking API — chưa nằm trong phạm vi lab hiện tại.',
  },
  transportation: {
    icon: 'directions_bus',
    title: 'Tiện ích giao thông',
    body: 'Bao gồm cả tra cứu phạt nguội theo dữ liệu công khai của CSGT — ngoài phạm vi lab này.',
  },
  travel: {
    icon: 'flight',
    title: 'Du lịch - Đi lại',
    body: 'Vé máy bay/khách sạn cần tích hợp OTA thật (Traveloka-style) — chưa có trong lab.',
  },
  ecommerce: {
    icon: 'shopping_bag',
    title: 'Thương mại điện tử',
    body: 'Mini-app marketplace của MoMo thật là cả một nền tảng riêng — ngoài phạm vi lab này.',
  },
  games: {
    icon: 'sports_esports',
    title: 'Game - Ứng dụng',
    body: 'Nền tảng mini-app/game của MoMo thật — ngoài phạm vi lab này.',
  },
  'counter-payment': {
    icon: 'storefront',
    title: 'Thanh toán tại quầy',
    body: 'Thanh toán QR tại quầy cần tích hợp máy POS/merchant thật — chưa có trong lab.',
  },
  charity: {
    icon: 'favorite',
    title: 'Ví Nhân Ái',
    body: 'Quyên góp cần đối tác tổ chức từ thiện đã xác minh — ngoài phạm vi lab này.',
  },
  deals: {
    icon: 'sell',
    title: 'Ưu đãi',
    body: 'Voucher/hoàn tiền thật cần hợp tác với merchant thật — không có đối tác nào trong lab này.',
  },
  qr: {
    icon: 'qr_code_scanner',
    title: 'Quét mọi QR',
    body: 'Cần quyền truy cập camera của trình duyệt và một chuẩn QR thanh toán thật để giải mã — chưa có trong lab.',
  },
  'bank-transfer': {
    icon: 'account_balance',
    title: 'Chuyển khoản từ ngân hàng',
    body: 'Nạp bằng chuyển khoản từ ngân hàng bất kỳ (không cần liên kết trước) cần một số tài khoản ảo/QR động riêng cho từng giao dịch — chưa có trong lab, hiện chỉ hỗ trợ nạp qua ngân hàng đã liên kết.',
  },
  'bank-p2p-transfer': {
    icon: 'account_balance',
    title: 'Chuyển khoản ngân hàng',
    body: 'Chuyển tiền ra ngoài hệ thống (NAPAS/liên ngân hàng) cần một rail thanh toán thật — payment-hub (dự án song song) có mô phỏng NAPAS, nhưng chưa nối 2 project lại. Trong lab này, "Chuyển tiền" chỉ hỗ trợ chuyển giữa 2 user Ewallet Lab.',
  },
  'send-card': {
    icon: 'card_giftcard',
    title: 'Gửi thiệp',
    body: 'Tính năng xã hội (thiệp kèm tiền mừng) — ngoài phạm vi lab tập trung vào giao dịch tài chính cốt lõi.',
  },
  'split-bill': {
    icon: 'call_split',
    title: 'Chia tiền',
    body: 'Cần theo dõi nhóm/hoá đơn chung — chưa có domain model cho việc này trong lab.',
  },
  fund: {
    icon: 'groups',
    title: 'Quỹ',
    body: 'Ví chung nhiều thành viên đóng góp — cần domain model và quyền truy cập riêng, chưa có trong lab.',
  },
};

export function ComingSoon({ feature, onBack }: { feature: string; onBack: () => void }) {
  const copy = COPY[feature] ?? { icon: 'construction', title: feature, body: 'Tính năng đang được lên kế hoạch.' };
  return (
    <Screen withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 24, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '30px 10px' }}>
        <Icon name={copy.icon} size={44} style={{ color: 'var(--el-accent)' }} />
        <h1 style={{ fontFamily: 'var(--el-font-display)', fontSize: 19, fontWeight: 800, margin: 0 }}>
          {copy.title} — sắp ra mắt
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--el-muted)', textAlign: 'center', maxWidth: 320, margin: 0 }}>
          {copy.body}
        </p>
        <Button variant="ghost" onClick={onBack} style={{ maxWidth: 200 }}>
          Đã hiểu
        </Button>
      </div>
    </Screen>
  );
}
