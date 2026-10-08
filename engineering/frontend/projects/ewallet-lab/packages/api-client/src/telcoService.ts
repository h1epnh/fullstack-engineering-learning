import { API_BASE, http } from './http';

export type TelcoProvider = 'VIETTEL' | 'VINAPHONE' | 'MOBIFONE';
export type TelcoOrderType = 'DIRECT_TOPUP' | 'CARD_PIN';
export type TelcoOrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED_REFUNDED';

export interface TelcoPackage {
  provider: TelcoProvider;
  providerName: string;
  denomination: number;
  discountRate: number;
  finalPrice: number;
}

export interface TelcoOrder {
  id: string;
  userId: string;
  phoneNumber?: string | null;
  telcoProvider: TelcoProvider;
  orderType: TelcoOrderType;
  denomination: number;
  discountRate: number;
  finalPrice: number;
  status: TelcoOrderStatus;
  pinCode?: string | null;
  serialNumber?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTelcoOrderRequest {
  userId: string;
  telcoProvider: TelcoProvider;
  orderType: TelcoOrderType;
  denomination: number;
  phoneNumber?: string;
  stepUpConfirmed?: boolean;
}

export const telcoService = {
  getPackages(): Promise<TelcoPackage[]> {
    return http.get<TelcoPackage[]>(`${API_BASE.topup}/telco/packages`);
  },

  createOrder(request: CreateTelcoOrderRequest): Promise<TelcoOrder> {
    return http.post<TelcoOrder>(`${API_BASE.topup}/telco/orders`, request);
  },

  getOrders(userId: string): Promise<TelcoOrder[]> {
    return http.get<TelcoOrder[]>(`${API_BASE.topup}/telco/orders?userId=${encodeURIComponent(userId)}`);
  },

  getOrder(id: string): Promise<TelcoOrder> {
    return http.get<TelcoOrder>(`${API_BASE.topup}/telco/orders/${encodeURIComponent(id)}`);
  },
};
