import { API_BASE, http } from './http';
import type { Transaction } from './walletService';

/**
 * Issue #12 — "Ví Gia Đình" (ý tưởng từ VNPay, KHÔNG PHẢI MoMo — xem backend DESIGN.md).
 * `family-wallet-service` chỉ lưu {parentUserId, memberUserId, monthlyLimit} — không tự di chuyển
 * tiền; enforcement thật nằm trong wallet-service's debit path.
 */
export type FamilyMember = {
  memberUserId: string;
  memberPhone: string;
  memberName: string;
  monthlyLimit: number;
  spentThisMonth: number;
  createdAt: string;
};

export const familyWalletService = {
  /** Upsert — thêm thành viên mới, hoặc cập nhật hạn mức nếu đã là thành viên của đúng parent này. */
  addOrUpdateMember: (parentUserId: string, memberPhone: string, monthlyLimit: number) =>
    http.post<FamilyMember>(`${API_BASE.familyWallet}/family-wallets/members`, {
      parentUserId,
      memberPhone,
      monthlyLimit,
    }),

  listMembers: (parentUserId: string) =>
    http.get<FamilyMember[]>(`${API_BASE.familyWallet}/family-wallets/members?parentUserId=${parentUserId}`),

  memberHistory: (parentUserId: string, memberUserId: string) =>
    http.get<Transaction[]>(
      `${API_BASE.familyWallet}/family-wallets/members/${memberUserId}/history?parentUserId=${parentUserId}`,
    ),
};
