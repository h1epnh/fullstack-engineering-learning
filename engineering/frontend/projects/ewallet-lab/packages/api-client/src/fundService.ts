import { API_BASE, http } from './http';

/**
 * Issue #14 — "Quỹ nhóm" (`fund-service`). Nguồn UX: fetch trực tiếp momo.vn/quy-nhom (xem backend
 * DESIGN.md) — khác với lúc issue được tạo (lúc đó chỉ qua search-snippet). MVP này KHÔNG có lãi
 * suất ("Sinh Lời Trên Quỹ Nhóm" — follow-up ticket riêng nếu Túi Thần Tài #13 xong trước), và chỉ
 * creator được rút/giải thể (real MoMo cho member request rút nhưng cần creator duyệt — lab đơn
 * giản hoá hơn nữa: không có luồng request/duyệt nào cả, operator đã confirm trên issue #14).
 */
export type FundStatus = 'ACTIVE' | 'DISSOLVED';

export type Fund = {
  id: string;
  creatorUserId: string;
  creatorName: string | null;
  creatorPhone: string | null;
  name: string;
  purpose: string | null;
  balance: number;
  status: FundStatus;
  createdAt: string;
};

export type FundMember = {
  memberUserId: string;
  memberPhone: string;
  memberName: string | null;
  joinedAt: string;
};

export type FundTransactionType = 'CONTRIBUTION' | 'WITHDRAWAL' | 'DISSOLVE';

export type FundTransaction = {
  id: string;
  actorUserId: string;
  type: FundTransactionType;
  amount: number;
  createdAt: string;
};

// 1.000đ tối thiểu/giao dịch — xác minh trực tiếp momo.vn/quy-nhom.
export const FUND_MIN_AMOUNT = 1000;

export const fundService = {
  create: (creatorUserId: string, name: string, purpose: string | undefined) =>
    http.post<Fund>(`${API_BASE.fund}/funds`, { creatorUserId, name, purpose }),

  get: (fundId: string, requesterUserId: string) =>
    http.get<Fund>(`${API_BASE.fund}/funds/${fundId}?requesterUserId=${requesterUserId}`),

  listForMember: (memberUserId: string) =>
    http.get<Fund[]>(`${API_BASE.fund}/funds?memberUserId=${memberUserId}`),

  listMembers: (fundId: string, requesterUserId: string) =>
    http.get<FundMember[]>(`${API_BASE.fund}/funds/${fundId}/members?requesterUserId=${requesterUserId}`),

  addMember: (fundId: string, requesterUserId: string, memberPhone: string) =>
    http.post<FundMember>(`${API_BASE.fund}/funds/${fundId}/members`, { requesterUserId, memberPhone }),

  listTransactions: (fundId: string, requesterUserId: string) =>
    http.get<FundTransaction[]>(`${API_BASE.fund}/funds/${fundId}/transactions?requesterUserId=${requesterUserId}`),

  /** `stepUpConfirmed` — issue #15 interaction: a large contribution counts as TRANSFER_OUT on the
   * member's own wallet and can come back as a 428. */
  contribute: (fundId: string, memberUserId: string, amount: number, stepUpConfirmed = false) =>
    http.post<Fund>(`${API_BASE.fund}/funds/${fundId}/contributions`, { memberUserId, amount, stepUpConfirmed }),

  withdraw: (fundId: string, requesterUserId: string, amount: number) =>
    http.post<Fund>(`${API_BASE.fund}/funds/${fundId}/withdrawals`, { requesterUserId, amount }),

  dissolve: (fundId: string, requesterUserId: string) =>
    http.post<Fund>(`${API_BASE.fund}/funds/${fundId}/dissolve`, { requesterUserId }),
};
