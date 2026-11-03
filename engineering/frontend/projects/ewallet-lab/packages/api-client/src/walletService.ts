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

export type SpendingPeriod = 'week' | 'month';

export type CategoryBreakdownItem = {
  categoryCode: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
};

export type SpendingTransactionItem = {
  id: string;
  source: 'WALLET' | 'CASH';
  amount: number;
  categoryCode: string;
  categoryName: string;
  icon: string;
  color: string;
  note: string | null;
  spentAt: string;
};

export type SpendingReport = {
  period: SpendingPeriod;
  periodStart: string;
  total: number;
  breakdown: Partial<Record<TransactionType, number>>;
  inWalletTotal?: number;
  externalTotal?: number;
  categoryBreakdown?: CategoryBreakdownItem[];
  transactions?: SpendingTransactionItem[];
};

export type SpendingCategory = {
  code: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
};

export type CreateCustomCategoryRequest = {
  code: string;
  name: string;
  icon?: string;
  color?: string;
};

export type CreateExternalExpenseRequest = {
  amount: number;
  categoryCode?: string;
  note?: string;
  spentAt?: string;
};

export type ExternalExpense = {
  id: string;
  userId: string;
  amount: number;
  categoryCode: string;
  note: string;
  spentAt: string;
  createdAt: string;
};

export type MonthlyBudget = {
  id: string;
  month: string;
  categoryCode: string;
  categoryName: string;
  budgetLimit: number;
  spentAmount: number;
  percentage: number;
  status: 'SAFE' | 'WARNING_80' | 'EXCEEDED_100';
};

export type SetMonthlyBudgetRequest = {
  month: string;
  categoryCode?: string;
  budgetLimit: number;
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

  // --- Issue #88: PFM 2.0 Methods ---

  setTransactionCategory: (userId: string, txId: string, categoryCode: string) =>
    http.put<void>(`${API_BASE.wallet}/wallets/${userId}/transactions/${txId}/category`, { categoryCode }),

  getSpendingCategories: (userId: string) =>
    http.get<SpendingCategory[]>(`${API_BASE.wallet}/wallets/${userId}/spending/categories`),

  createSpendingCategory: (userId: string, req: CreateCustomCategoryRequest) =>
    http.post<SpendingCategory>(`${API_BASE.wallet}/wallets/${userId}/spending/categories`, req),

  createExternalExpense: (userId: string, req: CreateExternalExpenseRequest) =>
    http.post<ExternalExpense>(`${API_BASE.wallet}/wallets/${userId}/spending/external-expenses`, req),

  getExternalExpenses: (userId: string) =>
    http.get<ExternalExpense[]>(`${API_BASE.wallet}/wallets/${userId}/spending/external-expenses`),

  deleteExternalExpense: (userId: string, expenseId: string) =>
    http.delete<void>(`${API_BASE.wallet}/wallets/${userId}/spending/external-expenses/${expenseId}`),

  getBudgets: (userId: string, month?: string) =>
    http.get<MonthlyBudget[]>(
      `${API_BASE.wallet}/wallets/${userId}/spending/budgets${month ? `?month=${encodeURIComponent(month)}` : ''}`
    ),

  setBudget: (userId: string, req: SetMonthlyBudgetRequest) =>
    http.put<MonthlyBudget>(`${API_BASE.wallet}/wallets/${userId}/spending/budgets`, req),
};
