import { API_BASE, http } from './http';

export type KycTier = 'UNVERIFIED' | 'VERIFIED';

export type UserResponse = {
  id: string;
  phone: string;
  name: string;
  kycTier?: KycTier;
  idCardNumber?: string;
};

export const userService = {
  register: (phone: string, name: string) =>
    http.post<UserResponse>(`${API_BASE.user}/users/register`, { phone, name }),

  getByPhone: (phone: string) =>
    http.get<UserResponse>(`${API_BASE.user}/users/by-phone/${encodeURIComponent(phone)}`),

  getById: (id: string) => http.get<UserResponse>(`${API_BASE.user}/users/${id}`),

  verifyKyc: (id: string, idCardNumber: string) =>
    http.post<UserResponse>(`${API_BASE.user}/users/${id}/verify-kyc`, { idCardNumber }),
};
