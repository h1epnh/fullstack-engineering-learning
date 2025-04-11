export type CreateServiceRequest = {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'MANICURE' | 'PEDICURE' | 'NAIL_ART' | 'TREATMENT';
};

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export type CreateAppointmentRequest = {
  serviceId: string;
  staffId: string;
  date: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};
