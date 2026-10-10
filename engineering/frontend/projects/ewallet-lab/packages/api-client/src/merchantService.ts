import { API_BASE, http } from './http';

export type RegisterMerchantRequest = {
  userId: string;
  merchantName: string;
  businessCategory: string;
};

export type MerchantResponse = {
  id: string;
  userId: string;
  merchantName: string;
  businessCategory: string;
  merchantQrCode: string;
  createdAt: string;
};

export const merchantService = {
  register: (req: RegisterMerchantRequest) =>
    http.post<MerchantResponse>(`${API_BASE.user}/merchants/register`, req),

  getByUserId: (userId: string) =>
    http.get<MerchantResponse>(`${API_BASE.user}/merchants/by-user/${userId}`),

  getById: (id: string) =>
    http.get<MerchantResponse>(`${API_BASE.user}/merchants/${id}`),
};
