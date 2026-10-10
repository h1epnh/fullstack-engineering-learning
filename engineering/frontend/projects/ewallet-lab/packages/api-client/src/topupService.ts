import { API_BASE, http } from './http';

export type LinkedBankAccount = {
  id: string;
  userId: string;
  bankCode: string;
  accountNumber: string;
};

export type TopupStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export type TopupResponse = {
  orderId: string;
  status: TopupStatus;
};

export type WithdrawalResponse = {
  userId: string;
  balance: number;
  fee?: number;
};

export type BankTransferOutResponse = {
  orderId: string;
  status: TopupStatus;
};

export const topupService = {
  linkBankAccount: (userId: string, bankCode: string, accountNumber: string) =>
    http.post<LinkedBankAccount>(`${API_BASE.topup}/linked-bank-accounts`, {
      userId,
      bankCode,
      accountNumber,
    }),

  getLinkedAccounts: (userId: string) =>
    http.get<LinkedBankAccount[]>(`${API_BASE.topup}/linked-bank-accounts/by-user/${userId}`),

  /** Minimum 10,000 VND — matches MoMo's own published first-deposit minimum, enforced
   * server-side by @DecimalMin on TopupRequestDto. `stepUpConfirmed` — issue #15: pass `true` when
   * retrying after the user confirms the (simulated) step-up prompt shown for a 428 response
   * (checked synchronously against wallet-service before the collection is even created). */
  initiateTopup: (userId: string, amount: number, stepUpConfirmed?: boolean) =>
    http.post<TopupResponse>(`${API_BASE.topup}/topups`, { userId, amount, stepUpConfirmed }),

  getTopupStatus: (orderId: string) =>
    http.get<TopupResponse>(`${API_BASE.topup}/topups/${orderId}`),

  /** Real, synchronous debit against wallet-service — see topup-service's WithdrawalController.
   * No minimum is enforced (no official MoMo source found for one); 409 means insufficient balance,
   * 428 means step-up confirmation is required (issue #15). */
  initiateWithdrawal: (userId: string, amount: number, stepUpConfirmed?: boolean) =>
    http.post<WithdrawalResponse>(`${API_BASE.topup}/withdrawals`, { userId, amount, stepUpConfirmed }),

  /** Real: debits wallet-service synchronously, then calls mock-bank-gateway — status stays
   * PENDING until the async IPN lands (see topup-service's BankTransferOutController). 409 means
   * insufficient balance, 428 means step-up confirmation is required (issue #15). */
  initiateBankTransferOut: (
    userId: string,
    bankCode: string,
    accountNumber: string,
    amount: number,
    stepUpConfirmed?: boolean,
  ) =>
    http.post<BankTransferOutResponse>(`${API_BASE.topup}/bank-transfers`, {
      userId,
      bankCode,
      accountNumber,
      amount,
      stepUpConfirmed,
    }),

  getBankTransferOutStatus: (orderId: string) =>
    http.get<BankTransferOutResponse>(`${API_BASE.topup}/bank-transfers/${orderId}`),
};
