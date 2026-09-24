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
   * server-side by @DecimalMin on TopupRequestDto. */
  initiateTopup: (userId: string, amount: number) =>
    http.post<TopupResponse>(`${API_BASE.topup}/topups`, { userId, amount }),

  getTopupStatus: (orderId: string) =>
    http.get<TopupResponse>(`${API_BASE.topup}/topups/${orderId}`),

  /** Real, synchronous debit against wallet-service — see topup-service's WithdrawalController.
   * No minimum is enforced (no official MoMo source found for one); 409 means insufficient balance. */
  initiateWithdrawal: (userId: string, amount: number) =>
    http.post<WithdrawalResponse>(`${API_BASE.topup}/withdrawals`, { userId, amount }),

  /** Real: debits wallet-service synchronously, then calls mock-bank-gateway — status stays
   * PENDING until the async IPN lands (see topup-service's BankTransferOutController). 409 means
   * insufficient balance. */
  initiateBankTransferOut: (userId: string, bankCode: string, accountNumber: string, amount: number) =>
    http.post<BankTransferOutResponse>(`${API_BASE.topup}/bank-transfers`, {
      userId,
      bankCode,
      accountNumber,
      amount,
    }),

  getBankTransferOutStatus: (orderId: string) =>
    http.get<BankTransferOutResponse>(`${API_BASE.topup}/bank-transfers/${orderId}`),
};
