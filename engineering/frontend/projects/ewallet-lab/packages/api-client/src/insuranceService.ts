import { API_BASE, http } from './http';

export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export type InsuranceProduct = {
  productCode: string;
  name: string;
  description: string;
  premiumAmount: number;
  coverageAmount: number;
  durationDays: number;
  durationText: string;
  requiresVehiclePlate: boolean;
};

export type InsurancePolicy = {
  id: string;
  userId: string;
  productCode: string;
  productName: string;
  insuredName: string;
  insuredIdCard: string;
  vehiclePlate: string | null;
  premiumAmount: number;
  coverageAmount: number;
  effectiveDate: string;
  expiryDate: string;
  certificateNumber: string;
  status: PolicyStatus;
  createdAt: string;
};

export const insuranceService = {
  getProducts: () => http.get<InsuranceProduct[]>(`${API_BASE.billPayment}/insurance/products`),

  buyPolicy: (data: {
    userId: string;
    productCode: string;
    insuredName: string;
    insuredIdCard: string;
    vehiclePlate?: string;
  }) => http.post<InsurancePolicy>(`${API_BASE.billPayment}/insurance/policies`, data),

  getPolicies: (userId: string) =>
    http.get<InsurancePolicy[]>(`${API_BASE.billPayment}/insurance/policies?userId=${userId}`),

  getCertificate: (id: string) =>
    http.get<InsurancePolicy>(`${API_BASE.billPayment}/insurance/policies/${id}/certificate`),
};
