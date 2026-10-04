import { API_BASE, http } from './http';

/**
 * Issue #18 — "Ví Trả Sau" MOCK credit line (bnpl-service). Learning simulation only: not a real
 * lending product, no real bank/finance company behind it.
 */
export type BnplStatementStatus = 'NOT_DUE' | 'OVERDUE' | 'SETTLED';

export type BnplStatement = {
  period: string;
  dueDate: string;
  principal: number;
  principalPaid: number;
  serviceFee: number;
  serviceFeePaid: number;
  lateFeePaid: number;
  daysLate: number;
  lateFeeRate: number;
  lateFeeDue: number;
  totalDue: number;
  status: BnplStatementStatus;
};

export type BnplDraw = { id: string; period: string; amount: number; label: string; createdAt: string };

export type BnplRepayment = {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
};

export type BnplWallet = {
  opened: boolean;
  creditLimit: number | null;
  availableLimit: number | null;
  outstandingPrincipal: number | null;
  totalDue: number | null;
  nextDueDate: string | null;
  overdue: boolean;
  today: string | null;
  disclaimerAcceptedAt: string | null;
  statements: BnplStatement[];
  draws: BnplDraw[];
  repayments: BnplRepayment[];
};

/** Mirrors bnpl-service's DrawRequestDto lower bound. */
export const BNPL_MIN_DRAW = 1000;

export const bnplService = {
  get: (userId: string) => http.get<BnplWallet>(`${API_BASE.bnpl}/bnpl/${userId}`),

  open: (userId: string) => http.post<BnplWallet>(`${API_BASE.bnpl}/bnpl/${userId}/open`, { acceptedDisclaimer: true }),

  draw: (userId: string, amount: number, label: string) =>
    http.post<BnplWallet>(`${API_BASE.bnpl}/bnpl/${userId}/draws`, { amount, label }),

  repay: (userId: string, amount: number) =>
    http.post<BnplWallet>(`${API_BASE.bnpl}/bnpl/${userId}/repayments`, { amount }),
};
