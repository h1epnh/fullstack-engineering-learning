import { API_BASE, http } from './http';

export type VoucherStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export type VoucherTemplate = {
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  applicableCategory?: string;
};

export type PassPackageDefinition = {
  code: string;
  name: string;
  description: string;
  price: number;
  validDays: number;
  voucherTemplates: VoucherTemplate[];
};

export type VoucherDto = {
  id: string;
  userId: string;
  passPurchaseId: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  applicableCategory?: string;
  status: VoucherStatus;
  expiresAt: string;
  usedAt?: string;
  usedBillId?: string;
  createdAt: string;
};

export type VoucherPassPurchaseDto = {
  id: string;
  userId: string;
  passCode: string;
  passName: string;
  price: number;
  status: 'ACTIVE' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  vouchers: VoucherDto[];
};

export const voucherPassService = {
  getDisclaimer: () =>
    http.get<{ title: string; disclaimer: string }>(`${API_BASE.loyalty}/loyalty/vouchers/disclaimer`),

  getCatalog: () =>
    http.get<PassPackageDefinition[]>(`${API_BASE.loyalty}/loyalty/voucher-passes`),

  purchasePass: (userId: string, passCode: string) =>
    http.post<VoucherPassPurchaseDto>(`${API_BASE.loyalty}/loyalty/voucher-passes/purchase`, {
      userId,
      passCode,
    }),

  getMyPurchases: (userId: string) =>
    http.get<VoucherPassPurchaseDto[]>(`${API_BASE.loyalty}/loyalty/voucher-passes/my?userId=${encodeURIComponent(userId)}`),

  getMyVouchers: (userId: string, status?: VoucherStatus) => {
    const q = status ? `&status=${encodeURIComponent(status)}` : '';
    return http.get<VoucherDto[]>(`${API_BASE.loyalty}/loyalty/vouchers/my?userId=${encodeURIComponent(userId)}${q}`);
  },

  getUsableVouchers: (userId: string, category?: string, amount?: number) => {
    const params = new URLSearchParams({ userId });
    if (category) params.append('category', category);
    if (amount != null) params.append('amount', String(amount));
    return http.get<VoucherDto[]>(`${API_BASE.loyalty}/loyalty/vouchers/usable?${params.toString()}`);
  },

  claimVoucher: (id: string, req: { userId: string; billCategory?: string; billAmount: number; billId?: string }) =>
    http.post<{ voucherId: string; code: string; title: string; discountAmount: number }>(
      `${API_BASE.loyalty}/loyalty/vouchers/${id}/claim`,
      req,
    ),
};

