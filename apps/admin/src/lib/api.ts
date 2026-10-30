// API URLs for different services
const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
  services: process.env.NEXT_PUBLIC_SERVICES_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
  orders: process.env.NEXT_PUBLIC_ORDERS_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
};

// Get API URL based on endpoint - server-side uses direct URLs, client-side uses rewrites
function getApiUrl(endpoint: string): string {
  // Client-side: use relative URL (works with Vercel rewrites)
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  // Server-side: route to appropriate backend based on endpoint
  if (endpoint.startsWith("/auth")) {
    return `${SERVICE_URLS.auth}/api`;
  }
  if (endpoint.startsWith("/services")) {
    return `${SERVICE_URLS.services}/api`;
  }
  if (endpoint.startsWith("/orders")) {
    return `${SERVICE_URLS.orders}/api`;
  }

  // Default fallback
  return process.env.INTERNAL_API_URL || "/api";
}

interface FetchOptions extends RequestInit {
  token?: string;
}

// Base fetch helper - all API calls go through this
async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const apiUrl = getApiUrl(endpoint);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Legacy exports for backwards compatibility
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return baseFetch<T>(endpoint, options);
}

export async function fetchServicesApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return baseFetch<T>(endpoint, options);
}

export async function fetchOrdersApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return baseFetch<T>(endpoint, options);
}

export async function fetchAuthApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return baseFetch<T>(`/auth${endpoint}`, options);
}

// Auth API - routes to /api/auth/*
export const authApi = {
  login: (email: string, password: string) =>
    baseFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) => baseFetch("/auth/me", { token }),

  refreshToken: (refreshToken: string) =>
    baseFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    ),

  forgotPassword: (email: string) =>
    baseFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    baseFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  validateResetToken: (token: string) =>
    baseFetch<{ valid: boolean }>(`/auth/validate-reset-token/${token}`),
};

// Types for Services API
export interface CategoryFeature {
  id: string;
  text: string;
  icon?: string;
  sortOrder: number;
}

export interface CategoryStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  features?: CategoryFeature[];
  steps?: CategoryStep[];
  _count?: { services: number };
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  sortOrder: number;
  category?: ServiceCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureInput {
  text: string;
  icon?: string;
  sortOrder?: number;
}

export interface CreateStepInput {
  stepNumber: number;
  title: string;
  description: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  features?: CreateFeatureInput[];
  steps?: CreateStepInput[];
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  features?: CreateFeatureInput[];
  steps?: CreateStepInput[];
}

export interface CreateServiceInput {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  basePrice: number;
  duration: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceInput {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  basePrice?: number;
  duration?: number;
  isActive?: boolean;
  sortOrder?: number;
}

// Services API - routes to /api/services/*
export const servicesApi = {
  // Categories
  getCategories: (
    params?: { includeInactive?: boolean; includeServices?: boolean },
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params?.includeInactive) query.set("includeInactive", "true");
    if (params?.includeServices) query.set("includeServices", "true");
    const queryStr = query.toString();
    return baseFetch<ServiceCategory[]>(
      `/services/categories${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  getCategory: (
    id: string,
    params?: { includeServices?: boolean },
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params?.includeServices) query.set("includeServices", "true");
    const queryStr = query.toString();
    return baseFetch<ServiceCategory>(
      `/services/categories/${id}${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  createCategory: (data: CreateCategoryInput, token: string) =>
    baseFetch<ServiceCategory>("/services/categories", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateCategory: (id: string, data: UpdateCategoryInput, token: string) =>
    baseFetch<ServiceCategory>(`/services/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteCategory: (id: string, token: string) =>
    baseFetch<void>(`/services/categories/${id}`, {
      method: "DELETE",
      token,
    }),

  toggleCategoryActive: (id: string, token: string) =>
    baseFetch<ServiceCategory>(`/services/categories/${id}/toggle-active`, {
      method: "PATCH",
      token,
    }),

  // Services
  getServices: (
    params?: { includeInactive?: boolean; includeCategory?: boolean },
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params?.includeInactive) query.set("includeInactive", "true");
    if (params?.includeCategory) query.set("includeCategory", "true");
    const queryStr = query.toString();
    return baseFetch<Service[]>(
      `/services${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  getServicesByCategory: (
    categoryId: string,
    params?: { includeInactive?: boolean },
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params?.includeInactive) query.set("includeInactive", "true");
    const queryStr = query.toString();
    return baseFetch<Service[]>(
      `/services/by-category/${categoryId}${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  getService: (
    id: string,
    params?: { includeCategory?: boolean },
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params?.includeCategory) query.set("includeCategory", "true");
    const queryStr = query.toString();
    return baseFetch<Service>(
      `/services/${id}${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  createService: (data: CreateServiceInput, token: string) =>
    baseFetch<Service>("/services", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateService: (id: string, data: UpdateServiceInput, token: string) =>
    baseFetch<Service>(`/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteService: (id: string, token: string) =>
    baseFetch<void>(`/services/${id}`, {
      method: "DELETE",
      token,
    }),

  toggleServiceActive: (id: string, token: string) =>
    baseFetch<Service>(`/services/${id}/toggle-active`, {
      method: "PATCH",
      token,
    }),
};

// Types for Orders API
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderAddress {
  area: string;
  city: string;
  division: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderTechnician {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  rating: number;
}

export interface OrderUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  bookingId: string;
  userId: string;
  technicianId?: string;
  status: OrderStatus;
  tier: "STANDARD" | "PREMIUM" | "DELUXE";
  tierName: string;
  baseAmount: number;
  totalAmount: number;
  scheduledDate: string;
  scheduledTime: string;
  areaSize?: string;
  additionalInfo?: string;
  createdAt: string;
  confirmedDate?: string;
  assignedAt?: string;
  startedAt?: string;
  completedDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  notes?: string;
  address: OrderAddress;
  items: OrderItem[];
  technician?: OrderTechnician;
  user?: OrderUser;
}

export interface OrderListItem {
  id: string;
  bookingId: string;
  status: OrderStatus;
  tier: string;
  totalAmount: number;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  serviceName: string;
  userName: string;
  technicianName?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "scheduledDate" | "totalAmount";
  sortOrder?: "asc" | "desc";
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
}

export interface AvailableTechnician {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  completedJobs: number;
  isAvailable: boolean;
}

export interface DashboardOverview {
  activeBookings: number;
  revenueMTD: number;
  totalUsers: number;
  totalTechnicians: number;
  trends: {
    bookingsChange: number;
    revenueChange: number;
  };
}

export interface RevenueBreakdown {
  date: string;
  amount: number;
  orders: number;
}

export interface RevenueAnalytics {
  total: number;
  period: "day" | "week" | "month" | "year";
  breakdown: RevenueBreakdown[];
  comparison: {
    previousPeriod: number;
    percentChange: number;
  };
}

export interface TopService {
  serviceId: string;
  name: string;
  bookings: number;
  revenue: number;
}

export interface TopServicesResponse {
  topByBookings: TopService[];
  topByRevenue: TopService[];
}

export interface TechnicianRanking {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  jobsCompleted: number;
  revenue: number;
  completionRate: number;
}

// Orders API - routes to /api/orders/*
export const ordersApi = {
  // List all orders with filters and pagination
  getOrders: (params?: OrderQueryParams, token?: string) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.technicianId) query.set("technicianId", params.technicianId);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.search) query.set("search", params.search);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
    const queryStr = query.toString();
    return baseFetch<OrdersListResponse>(
      `/orders/admin/orders${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  // Get single order details
  getOrder: (id: string, token: string) =>
    baseFetch<OrderDetailResponse>(`/orders/admin/orders/${id}`, { token }),

  // Update order
  updateOrder: (id: string, data: UpdateOrderInput, token: string) =>
    baseFetch<OrderDetailResponse>(`/orders/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  // Cancel/delete order
  deleteOrder: (id: string, token: string) =>
    baseFetch<{ success: boolean; message: string }>(
      `/orders/admin/orders/${id}`,
      {
        method: "DELETE",
        token,
      }
    ),

  // Assign technician to order
  assignTechnician: (orderId: string, technicianId: string, token: string) =>
    baseFetch<OrderDetailResponse>(
      `/orders/admin/orders/${orderId}/assign`,
      {
        method: "POST",
        body: JSON.stringify({ technicianId }),
        token,
      }
    ),

  // Get available technicians for assignment
  getAvailableTechnicians: (
    params?: { division?: string; serviceCategory?: string },
    token?: string
  ) => {
    const query = new URLSearchParams();
    if (params?.division) query.set("division", params.division);
    if (params?.serviceCategory)
      query.set("serviceCategory", params.serviceCategory);
    const queryStr = query.toString();
    return baseFetch<{ success: boolean; data: AvailableTechnician[] }>(
      `/orders/admin/technicians${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  // Analytics endpoints
  getOverviewStats: (token: string) =>
    baseFetch<{ success: boolean; data: DashboardOverview }>(
      "/orders/admin/analytics/overview",
      { token }
    ),

  getRevenueAnalytics: (
    period: "day" | "week" | "month" | "year",
    token: string
  ) =>
    baseFetch<{ success: boolean; data: RevenueAnalytics }>(
      `/orders/admin/analytics/revenue?period=${period}`,
      { token }
    ),

  getTopServices: (limit: number, token: string) =>
    baseFetch<{ success: boolean; data: TopServicesResponse }>(
      `/orders/admin/analytics/services?limit=${limit}`,
      { token }
    ),

  getTechnicianRankings: (limit: number, token: string) =>
    baseFetch<{ success: boolean; data: TechnicianRanking[] }>(
      `/orders/admin/analytics/technicians?limit=${limit}`,
      { token }
    ),
};
