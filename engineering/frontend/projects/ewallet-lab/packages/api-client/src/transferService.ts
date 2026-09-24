import { API_BASE, http } from './http';

export type TransferResponse = {
  fromUserId: string;
  toUserId: string;
  toName: string;
  newBalance: number;
};

export const transferService = {
  /** Real saga (see transfer-service's TransferService.java): looks up the recipient again
   * itself server-side even though the frontend already did a client-side userService.getByPhone
   * lookup for the confirm-screen preview — harmless duplication, and it means the preview can
   * never show a name the actual transfer doesn't also verify. */
  transfer: (fromUserId: string, toPhone: string, amount: number) =>
    http.post<TransferResponse>(`${API_BASE.transfer}/transfers`, { fromUserId, toPhone, amount }),
};
