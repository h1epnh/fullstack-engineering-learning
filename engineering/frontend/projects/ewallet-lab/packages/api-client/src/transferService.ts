import { API_BASE, http } from './http';

export type TransferResponse = {
  fromUserId: string;
  toUserId: string;
  toName: string;
  newBalance: number;
};

export type SavedPayee = {
  id: string;
  userId: string;
  payeePhone: string;
  payeeName: string;
  nickname?: string;
  isFavorite: boolean;
  lastTransferredAt?: string;
  createdAt: string;
};

export type CreatePayeeRequest = {
  payeePhone: string;
  nickname?: string;
  isFavorite?: boolean;
};

export type UpdatePayeeRequest = {
  nickname?: string;
  isFavorite?: boolean;
};

export type RecurringTransfer = {
  id: string;
  senderId: string;
  recipientPhone: string;
  recipientUserId: string;
  amount: number;
  message?: string;
  frequency: 'WEEKLY' | 'MONTHLY';
  executionDay: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  lastExecutionDate?: string;
  nextExecutionDate: string;
  createdAt: string;
};

export type CreateRecurringTransferRequest = {
  senderId: string;
  recipientPhone: string;
  amount: number;
  message?: string;
  frequency: 'WEEKLY' | 'MONTHLY';
  executionDay: number;
  startDate: string;
  endDate?: string;
};

export type RecurringTransferLog = {
  id: string;
  recurringTransferId: string;
  executedAt: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED_INSUFFICIENT_FUNDS' | 'FAILED_STEP_UP_REQUIRED' | 'FAILED_LIMIT_EXCEEDED';
  errorMessage?: string;
};

export type RecurringRunSummary = {
  scannedCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  logs: RecurringTransferLog[];
};

export const transferService = {
  /** Real saga (see transfer-service's TransferService.java): looks up the recipient again
   * itself server-side even though the frontend already did a client-side userService.getByPhone
   * lookup for the confirm-screen preview — harmless duplication, and it means the preview can
   * never show a name the actual transfer doesn't also verify. */
  /** `stepUpConfirmed` — issue #15: pass `true` when retrying after the user has confirmed the
   * (simulated) step-up prompt shown for a 428 response. */
  transfer: (fromUserId: string, toPhone: string, amount: number, stepUpConfirmed?: boolean) =>
    http.post<TransferResponse>(`${API_BASE.transfer}/transfers`, { fromUserId, toPhone, amount, stepUpConfirmed }),

  // Issue #32: Saved Payees & Favorites
  listPayees: (userId: string) =>
    http.get<SavedPayee[]>(`${API_BASE.transfer}/users/${userId}/payees`),

  savePayee: (userId: string, req: CreatePayeeRequest) =>
    http.post<SavedPayee>(`${API_BASE.transfer}/users/${userId}/payees`, req),

  updatePayee: (userId: string, id: string, req: UpdatePayeeRequest) =>
    http.put<SavedPayee>(`${API_BASE.transfer}/users/${userId}/payees/${id}`, req),

  deletePayee: (userId: string, id: string) =>
    http.delete<void>(`${API_BASE.transfer}/users/${userId}/payees/${id}`),

  // Issue #31: Recurring Transfers
  listRecurringTransfers: (senderId: string) =>
    http.get<RecurringTransfer[]>(`${API_BASE.transfer}/recurring-transfers?senderId=${senderId}`),

  createRecurringTransfer: (req: CreateRecurringTransferRequest) =>
    http.post<RecurringTransfer>(`${API_BASE.transfer}/recurring-transfers`, req),

  updateRecurringStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') =>
    http.put<RecurringTransfer>(`${API_BASE.transfer}/recurring-transfers/${id}/status`, { status }),

  getRecurringLogs: (id: string) =>
    http.get<RecurringTransferLog[]>(`${API_BASE.transfer}/recurring-transfers/${id}/logs`),

  triggerRecurringRun: () =>
    http.post<RecurringRunSummary>(`${API_BASE.transfer}/recurring-transfers/trigger-run`, {}),
};
