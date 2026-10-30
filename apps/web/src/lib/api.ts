import type { ApiCategory, ApiService, SearchResult } from "@/types/api";
import type {
  BookingFormData,
  BookingDetail,
  BookingListResponse,
  CreateBookingResponse,
  AddReviewData,
} from "@/types/booking";

// API URLs for different services
const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
  services: process.env.NEXT_PUBLIC_SERVICES_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
  orders: process.env.NEXT_PUBLIC_ORDERS_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
  payment: process.env.NEXT_PUBLIC_PAYMENT_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
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
  if (endpoint.startsWith("/payment")) {
    return `${SERVICE_URLS.payment}/api`;
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

// Legacy fetchApi for backwards compatibility
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  return baseFetch<T>(endpoint, options);
}

// Auth API - routes to /api/auth/*
export const authApi = {
  login: (email: string, password: string) =>
    baseFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) =>
    baseFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  google: (credential: string) =>
    baseFetch("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),

  me: (token: string) => baseFetch("/auth/me", { token }),

  updateProfile: (data: Record<string,string>, token: string) =>
    baseFetch("/auth/me", { method:"PATCH", body:JSON.stringify(data), token }),

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

// Orders API (legacy) - routes to /api/orders/*
export const ordersApi = {
  list: (token: string) =>
    baseFetch("/orders", { token }),

  get: (id: string, token: string) =>
    baseFetch(`/orders/${id}`, { token }),

  create: (data: unknown, token: string) =>
    baseFetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
};

// Bookings API - Customer booking operations (routes to /api/orders/*)
export const bookingsApi = {
  // Create a new booking
  create: (data: BookingFormData, token: string) =>
    baseFetch<{ success: boolean; data: CreateBookingResponse }>(
      "/orders/bookings",
      {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }
    ),

  // List user's bookings with pagination
  list: (
    token: string,
    options?: { page?: number; limit?: number; status?: string }
  ) => {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.status) params.set("status", options.status);
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<{ success: boolean } & BookingListResponse>(
      `/orders/bookings${query}`,
      { token }
    );
  },

  // Get single booking details
  getDetails: (bookingId: string, token: string) =>
    baseFetch<{ success: boolean; data: BookingDetail }>(
      `/orders/bookings/${bookingId}`,
      { token }
    ),

  // Cancel a booking
  cancel: (bookingId: string, reason: string, token: string) =>
    baseFetch<{ success: boolean; message: string }>(
      `/orders/bookings/${bookingId}/cancel`,
      {
        method: "PATCH",
        body: JSON.stringify({ reason }),
        token,
      }
    ),

  // Add review to completed booking
  addReview: (bookingId: string, data: AddReviewData, token: string) =>
    baseFetch<{ success: boolean; message: string }>(
      `/orders/bookings/${bookingId}/review`,
      {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }
    ),
};

// Services API - routes to /api/services/*
export const servicesApi = {
  // Categories
  getCategories: (options?: { includeServices?: boolean; includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeServices) params.set("includeServices", "true");
    if (options?.includeInactive) params.set("includeInactive", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiCategory[]>(`/services/categories${query}`);
  },

  getCategoryBySlug: (slug: string, options?: { includeServices?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeServices) params.set("includeServices", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiCategory>(`/services/categories/by-slug/${slug}${query}`);
  },

  getCategoryById: (id: string, options?: { includeServices?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeServices) params.set("includeServices", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiCategory>(`/services/categories/${id}${query}`);
  },

  // Services
  getServices: (options?: { includeCategory?: boolean; includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeCategory) params.set("includeCategory", "true");
    if (options?.includeInactive) params.set("includeInactive", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiService[]>(`/services${query}`);
  },

  getServicesByCategory: (categoryId: string, options?: { includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeInactive) params.set("includeInactive", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiService[]>(`/services/by-category/${categoryId}${query}`);
  },

  getServicesByCategorySlug: (categorySlug: string, options?: { includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeInactive) params.set("includeInactive", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiService[]>(`/services/by-category-slug/${categorySlug}${query}`);
  },

  getServiceBySlug: (categorySlug: string, serviceSlug: string) =>
    baseFetch<ApiService>(`/services/by-slug/${categorySlug}/${serviceSlug}`),

  getServiceById: (id: string, options?: { includeCategory?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.includeCategory) params.set("includeCategory", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return baseFetch<ApiService>(`/services/${id}${query}`);
  },

  // Search
  search: (query: string) =>
    baseFetch<SearchResult>(`/services/search?q=${encodeURIComponent(query)}`),
};
