import { API_BASE, http } from './http';

export type UserResponse = {
  id: string;
  phone: string;
  name: string;
};

export const userService = {
  register: (phone: string, name: string) =>
    http.post<UserResponse>(`${API_BASE.user}/users/register`, { phone, name }),

  getByPhone: (phone: string) =>
    http.get<UserResponse>(`${API_BASE.user}/users/by-phone/${encodeURIComponent(phone)}`),

  getById: (id: string) => http.get<UserResponse>(`${API_BASE.user}/users/${id}`),
};
