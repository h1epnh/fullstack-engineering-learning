import { API_BASE, http } from './http';

export type WalletResponse = {
  userId: string;
  balance: number;
};

export type TransactionType =
  | 'TOPUP'
  | 'WITHDRAW'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'BILL_PAYMENT'
  | 'BNPL_REPAYMENT'
  | 'LOYALTY_REDEMPTION';

export type Transaction = {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
};

/** Issue #16 — "Quản lý chi tiêu" MVP báo cáo tự động, read-only trên `Transaction` có sẵn. */
export type SpendingPeriod = 'week' | 'month';

export type SpendingReport = {
  period: SpendingPeriod;
  periodStart: string;
  total: number;
  breakdown: Partial<Record<TransactionType, number>>;
};

export const walletService = {
  getBalance: (userId: string) => http.get<WalletResponse>(`${API_BASE.wallet}/wallets/${userId}/balance`),

  getTransactions: (userId: string) =>
    http.get<Transaction[]>(`${API_BASE.wallet}/wallets/${userId}/transactions`),

  getSpendingReport: (userId: string, period: SpendingPeriod) =>
    http.get<SpendingReport>(`${API_BASE.wallet}/wallets/${userId}/spending-report?period=${period}`),
};
