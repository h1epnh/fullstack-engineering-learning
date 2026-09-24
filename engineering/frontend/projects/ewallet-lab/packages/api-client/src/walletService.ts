import { API_BASE, http } from './http';

export type WalletResponse = {
  userId: string;
  balance: number;
};

export type TransactionType = 'TOPUP' | 'WITHDRAW' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'BILL_PAYMENT';

export type Transaction = {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
};

export const walletService = {
  getBalance: (userId: string) => http.get<WalletResponse>(`${API_BASE.wallet}/wallets/${userId}/balance`),

  getTransactions: (userId: string) =>
    http.get<Transaction[]>(`${API_BASE.wallet}/wallets/${userId}/transactions`),
};
