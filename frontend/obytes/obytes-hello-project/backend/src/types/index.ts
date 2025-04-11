// User Types
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'STAFF';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Service Types
export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'MANICURE' | 'PEDICURE' | 'NAIL_ART' | 'TREATMENT';
  createdAt: Date;
  updatedAt: Date;
};

// Appointment Types
export type Appointment = {
  id: string;
  userId: string;
  serviceId: string;
  staffId: string;
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
};

// Request Types
export type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserRequest = Partial<CreateUserRequest>;

export type CreateServiceRequest = Omit<
  Service,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export type CreateAppointmentRequest = Omit<
  Appointment,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>;

// Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
