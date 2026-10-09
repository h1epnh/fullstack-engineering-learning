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
  | 'REFUND'
  | 'BNPL_REPAYMENT'
  | 'LOYALTY_REDEMPTION'
  | 'INVESTMENT_BUY'
  | 'INVESTMENT_SELL'
  | 'SAVINGS_GOAL_DEPOSIT'
  | 'SAVINGS_GOAL_WITHDRAW'
  | 'VOUCHER_PASS_PURCHASE';

/** Issue #36 — mirrors backend's `TransactionDirection`. */
export type TransactionDirection = 'IN' | 'OUT';

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

/** Issue #36 — "Bộ lọc lịch sử giao dịch thông minh". Mirrors backend's `TransactionPageDto`. */
export type TransactionPage = {
  transactions: Transaction[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type TransactionSearchFilters = {
  type?: TransactionType;
  direction?: TransactionDirection;
  /** ISO-8601 instant string (e.g. `new Date(...).toISOString()`), inclusive. */
  fromDate?: string;
  /** ISO-8601 instant string, exclusive. */
  toDate?: string;
  page?: number;
  size?: number;
};

/** Issue #36 — "Xuất sao kê tài chính". Mirrors backend's `StatementTransactionDto`. */
export type StatementTransaction = {
  id: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
  balanceAfter: number;
};

/** Mirrors backend's `AccountStatementDto`. */
export type AccountStatement = {
  walletId: string;
  userId: string;
  period: string;
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
  transactionsCount: number;
  transactions: StatementTransaction[];
  generatedAt: string;
};

function buildSearchQuery(filters: TransactionSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.direction) params.set('direction', filters.direction);
  if (filters.fromDate) params.set('fromDate', filters.fromDate);
  if (filters.toDate) params.set('toDate', filters.toDate);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.size !== undefined) params.set('size', String(filters.size));
  return params.toString();
}

export const walletService = {
  getBalance: (userId: string) => http.get<WalletResponse>(`${API_BASE.wallet}/wallets/${userId}/balance`),

  getTransactions: (userId: string) =>
    http.get<Transaction[]>(`${API_BASE.wallet}/wallets/${userId}/transactions`),

  searchTransactions: (userId: string, filters: TransactionSearchFilters = {}) =>
    http.get<TransactionPage>(
      `${API_BASE.wallet}/wallets/${userId}/transactions/search?${buildSearchQuery(filters)}`
    ),

  getSpendingReport: (userId: string, period: SpendingPeriod) =>
    http.get<SpendingReport>(`${API_BASE.wallet}/wallets/${userId}/spending-report?period=${period}`),

  /** `month` là `yyyy-MM`, vd `"2026-09"`. */
  getStatement: (userId: string, month: string) =>
    http.get<AccountStatement>(`${API_BASE.wallet}/wallets/${userId}/statement?month=${month}`),

  /** Trả về URL tải CSV trực tiếp (dùng cho `<a download>`/`window.open`, không qua `http.get` vì
   * đây là file, không phải JSON). */
  getStatementCsvUrl: (userId: string, month: string) =>
    `${API_BASE.wallet}/wallets/${userId}/statement/export?month=${month}&format=csv`,
};
