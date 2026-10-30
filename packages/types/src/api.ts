// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "customer" | "technician";
}

// Order API types
export interface CreateOrderRequest {
  items: Array<{
    serviceId: string;
    quantity: number;
  }>;
  scheduledDate?: string;
  notes?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

// Payment API types
export interface CreatePaymentRequest {
  orderId: string;
  method: "card" | "bank_transfer";
  cardToken?: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  createdAt: string;
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";
