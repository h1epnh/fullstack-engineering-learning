export interface ServiceItem {
  key: string;
  icon: string;
  label: string;
  category: string;
  routeKey: string;
  keywords: string[];
  real?: boolean;
}

export const ALL_SERVICE_CATEGORIES: { name: string; icon: string; items: ServiceItem[] }[] = [
  {
    name: 'Chuyển & Nhận tiền',
    icon: 'payments',
    items: [
      { key: 'transfer', icon: 'north_east', label: 'Chuyển ví-ví', category: 'Chuyển & Nhận tiền', routeKey: 'transfer', keywords: ['chuyen tien', 'vi-vi', 'p2p', 'noi bo'], real: true },
      { key: 'bank-transfer', icon: 'account_balance', label: 'VietQR 24/7', category: 'Chuyển & Nhận tiền', routeKey: 'transfer', keywords: ['chuyen ngan hang', 'vietqr', 'napas', '247'], real: true },
      { key: 'receive', icon: 'call_received', label: 'Nhận tiền QR', category: 'Chuyển & Nhận tiền', routeKey: 'receive', keywords: ['nhan tien', 'qr ca nhan', 'ma qr'], real: true },
      { key: 'scheduled-transfer', icon: 'schedule', label: 'Chuyển định kỳ', category: 'Chuyển & Nhận tiền', routeKey: 'transfer', keywords: ['dinh ky', 'lap lai', 'hen gio chuyen'], real: true },
      { key: 'split-bill', icon: 'group', label: 'Chia tiền nhóm', category: 'Chuyển & Nhận tiền', routeKey: 'transfer', keywords: ['chia tien', 'split', 'chia deu', 'nhom an'], real: true },
      { key: 'send-card', icon: 'card_giftcard', label: 'Chuyển kèm thiệp', category: 'Chuyển & Nhận tiền', routeKey: 'transfer', keywords: ['thiep mung', 'sinh nhat', 'phong thuy', 'chuc mung'], real: true },
    ],
  },
  {
    name: 'Hoá đơn & Viễn thông',
    icon: 'receipt_long',
    items: [
      { key: 'bill-payment', icon: 'receipt_long', label: 'Thanh toán hoá đơn', category: 'Hoá đơn & Viễn thông', routeKey: 'bill-payment', keywords: ['dien', 'nuoc', 'internet', 'evn', 'truyen hinh'], real: true },
      { key: 'phone-topup', icon: 'call', label: 'Nạp tiền ĐT', category: 'Hoá đơn & Viễn thông', routeKey: 'phone-topup', keywords: ['nap the', 'dien thoai', 'viettel', 'vina', 'mobi'], real: true },
      { key: 'phone-data', icon: 'signal_cellular_alt', label: 'Data 4G/5G', category: 'Hoá đơn & Viễn thông', routeKey: 'phone-topup', keywords: ['data', '4g', '5g', 'dung luong', 'goi cuoc'], real: true },
      { key: 'parking', icon: 'local_parking', label: 'Phí đỗ xe', category: 'Hoá đơn & Viễn thông', routeKey: 'bill-payment', keywords: ['gui xe', 'do xe', 'parking'], real: true },
      { key: 'loan-bill', icon: 'payments', label: 'Khoản vay & Thẻ', category: 'Hoá đơn & Viễn thông', routeKey: 'bill-payment', keywords: ['vay tieu dung', 'tai chinh', 'tra gop'], real: true },
      { key: 'e-invoice', icon: 'description', label: 'Hoá đơn điện tử', category: 'Hoá đơn & Viễn thông', routeKey: 'bill-payment', keywords: ['hoa don dien tu', 'thue', 'tra cuu'], real: true },
    ],
  },
  {
    name: 'Tài chính & Đầu tư',
    icon: 'trending_up',
    items: [
      { key: 'savings-pocket', icon: 'savings', label: 'Túi Thần Tài', category: 'Tài chính & Đầu tư', routeKey: 'savings-pocket', keywords: ['tui than tai', 'lai ngay', 'sinh loi', 'tich luy'], real: true },
      { key: 'bnpl', icon: 'credit_score', label: 'Ví Trả Sau', category: 'Tài chính & Đầu tư', routeKey: 'bnpl', keywords: ['vi tra sau', 'bnpl', 'mua truoc tra sau', 'han muc'], real: true },
      { key: 'investment-fund', icon: 'trending_up', label: 'Sàn Đầu Tư CCQ', category: 'Tài chính & Đầu tư', routeKey: 'investment-fund', keywords: ['chung chi quy', 'dau tu', 'ccq', 'sip'], real: true },
      { key: 'savings-goals', icon: 'savings', label: 'Heo Tiết Kiệm', category: 'Tài chính & Đầu tư', routeKey: 'savings-goals', keywords: ['heo dat', 'muc tieu', 'tiet kiem', 'gom tien'], real: true },
      { key: 'spending', icon: 'bar_chart', label: 'Quản lý chi tiêu', category: 'Tài chính & Đầu tư', routeKey: 'spending-report', keywords: ['chi tieu', 'bao cao', 'thong ke', 'so thu chi'], real: true },
      { key: 'loyalty', icon: 'loyalty', label: 'Điểm thưởng', category: 'Tài chính & Đầu tư', routeKey: 'loyalty', keywords: ['diem thuong', 'doi qua', 'xu', 'nhiem vu'], real: true },
      { key: 'voucher-pass', icon: 'sell', label: 'Gói Voucher Pass', category: 'Tài chính & Đầu tư', routeKey: 'voucher-pass', keywords: ['goi voucher', 'hoi vien', 'giam gia', 'pass'], real: true },
      { key: 'deals', icon: 'local_offer', label: 'Săn ưu đãi', category: 'Tài chính & Đầu tư', routeKey: 'deals', keywords: ['uu dai', 'deals', 'voucher', 'khuyen mai', 'flash deals'], real: true },
    ],
  },
  {
    name: 'Bảo hiểm & Sức khoẻ',
    icon: 'health_and_safety',
    items: [
      { key: 'micro-insurance', icon: 'health_and_safety', label: 'Bảo hiểm xe & tai nạn', category: 'Bảo hiểm & Sức khoẻ', routeKey: 'coming-soon', keywords: ['bao hiem', 'xe may', 'tai nan', 'o to'], real: false },
      { key: 'social-insurance', icon: 'volunteer_activism', label: 'BHXH & BHYT', category: 'Bảo hiểm & Sức khoẻ', routeKey: 'coming-soon', keywords: ['bhxh', 'bhyt', 'bao hiem xa hoi', 'y te'], real: false },
      { key: 'medical-fee', icon: 'local_hospital', label: 'Viện phí & Khám bệnh', category: 'Bảo hiểm & Sức khoẻ', routeKey: 'coming-soon', keywords: ['benh vien', 'vien phi', 'dat lich kham'], real: false },
    ],
  },
  {
    name: 'Du lịch & Giải trí',
    icon: 'flight_takeoff',
    items: [
      { key: 'travel-ticketing', icon: 'flight_takeoff', label: 'Vé máy bay/xe', category: 'Du lịch & Giải trí', routeKey: 'coming-soon', keywords: ['ve xe', 'may bay', 'khach san', 'du lich'], real: false },
      { key: 'digital-services', icon: 'local_movies', label: 'Vé xem phim', category: 'Du lịch & Giải trí', routeKey: 'coming-soon', keywords: ['rap phim', 'cgv', 'lotte', 've phim'], real: false },
      { key: 'games', icon: 'sports_esports', label: 'Nạp thẻ Game', category: 'Du lịch & Giải trí', routeKey: 'games', keywords: ['garena', 'zing', 'game', 'the game'], real: true },
    ],
  },
  {
    name: 'Gia đình & Cộng đồng',
    icon: 'groups',
    items: [
      { key: 'family-wallet', icon: 'family_restroom', label: 'Ví Gia Đình', category: 'Gia đình & Cộng đồng', routeKey: 'family-wallet', keywords: ['gia dinh', 'thanh vien', 'han muc con'], real: true },
      { key: 'fund', icon: 'groups', label: 'Quỹ nhóm', category: 'Gia đình & Cộng đồng', routeKey: 'coming-soon', keywords: ['quy chung', 'dong gop', 'quy ban be'], real: false },
      { key: 'lucky-money', icon: 'redeem', label: 'Lì xì', category: 'Gia đình & Cộng đồng', routeKey: 'coming-soon', keywords: ['li xi', 'mung tuoi', 'may man'], real: false },
    ],
  },
];

export const ALL_SERVICES_FLAT: ServiceItem[] = ALL_SERVICE_CATEGORIES.flatMap((c) => c.items);

export const DEFAULT_PINNED_KEYS: string[] = [
  'transfer',
  'bank-transfer',
  'bill-payment',
  'phone-topup',
  'phone-data',
  'family-wallet',
  'spending',
];

export function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
