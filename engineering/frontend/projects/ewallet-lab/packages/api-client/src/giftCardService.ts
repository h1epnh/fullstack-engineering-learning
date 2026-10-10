import { API_BASE, http } from './http';

export type GiftCardStatus = 'SENT' | 'OPENED';

export type GiftCardTemplate = {
  templateCode: string;
  title: string;
  defaultMessage: string;
  themeColor: string;
  icon: string;
};

export type GiftCardTransfer = {
  id: string;
  senderId: string;
  senderName: string;
  recipientPhone: string;
  recipientUserId: string;
  recipientName: string;
  amount: number;
  templateCode: string;
  customMessage: string | null;
  status: GiftCardStatus;
  openedAt: string | null;
  replyMessage: string | null;
  createdAt: string;
};

export const giftCardService = {
  getTemplates: () =>
    http.get<GiftCardTemplate[]>(`${API_BASE.luckyMoney}/gift-cards/templates`),

  send: (data: {
    senderId: string;
    senderName: string;
    recipientPhone: string;
    amount: number;
    templateCode: string;
    customMessage?: string;
    stepUpConfirmed?: boolean;
  }) => http.post<GiftCardTransfer>(`${API_BASE.luckyMoney}/gift-cards/send`, data),

  getReceived: (recipientUserId: string) =>
    http.get<GiftCardTransfer[]>(`${API_BASE.luckyMoney}/gift-cards/received?recipientUserId=${recipientUserId}`),

  getSent: (senderId: string) =>
    http.get<GiftCardTransfer[]>(`${API_BASE.luckyMoney}/gift-cards/sent?senderId=${senderId}`),

  getById: (id: string) =>
    http.get<GiftCardTransfer>(`${API_BASE.luckyMoney}/gift-cards/${id}`),

  open: (id: string, recipientUserId?: string) =>
    http.post<GiftCardTransfer>(`${API_BASE.luckyMoney}/gift-cards/${id}/open`, { recipientUserId }),

  reply: (id: string, recipientUserId: string, replyMessage: string) =>
    http.post<GiftCardTransfer>(`${API_BASE.luckyMoney}/gift-cards/${id}/reply`, { recipientUserId, replyMessage }),
};
