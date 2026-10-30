// API URLs for different services
const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_URL || process.env.API_GATEWAY_ORIGIN || "http://localhost",
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
    role: string;
  }) =>
    baseFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
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

// Types for Jobs API
export type JobStatus = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";

export interface JobAddress {
  area: string;
  city: string;
  division: string;
  postalCode: string;
  fullAddress: string;
}

export interface JobCustomer {
  id: string;
  name: string;
  phone?: string | null;
}

export interface JobItem {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Job {
  id: string;
  bookingId: string;
  status: JobStatus;
  serviceName: string;
  customer: {
    name: string;
    phone: string | null;
  };
  address: JobAddress;
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedDuration: number;
  totalAmount: number;
  urgency: "normal" | "urgent";
  notes: string | null;
  additionalInfo: string | null;
}

export interface JobListItem {
  id: string;
  bookingId: string;
  status: JobStatus;
  serviceName: string;
  customer: {
    name: string;
    phone: string | null;
  };
  address: JobAddress;
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedDuration: number;
  totalAmount: number;
  urgency: "normal" | "urgent";
  notes: string | null;
  additionalInfo: string | null;
}

export interface JobsListResponse {
  success: boolean;
  data: JobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AvailableJob {
  id: string;
  bookingId: string;
  serviceName: string;
  serviceCategory: string;
  address: {
    city: string;
    division: string;
    area: string;
  };
  scheduledDate: string | null;
  scheduledTime: string | null;
  estimatedEarnings: {
    min: number;
    max: number;
  };
  postedAt: string;
}

export interface AvailableJobsResponse {
  success: boolean;
  data: AvailableJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TechnicianSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface EarningsData {
  total: number;
  period: "week" | "month" | "year";
  jobsCompleted: number;
  breakdown: Array<{
    date: string;
    amount: number;
    jobs: number;
  }>;
}

export interface EarningsHistoryItem {
  id: string;
  bookingId: string;
  serviceName: string;
  amount: number;
  completedDate: string;
}

export interface TechnicianStats {
  rating: number;
  totalJobs: number;
  completedJobs: number;
  completionRate: number;
  totalEarnings: number;
}

export interface TechnicianProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  isAvailable: boolean;
  verificationStatus?: string;
  serviceAreas: string[];
  specializations: string[];
}

// Jobs API - routes to /api/orders/technician/*
export const jobsApi = {
  // Get assigned jobs
  getAssignedJobs: (
    token: string,
    params?: { status?: "assigned" | "in_progress"; date?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.date) query.set("date", params.date);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const queryStr = query.toString();
    return baseFetch<JobsListResponse>(
      `/orders/technician/jobs${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  // Get available jobs to accept
  getAvailableJobs: (
    token: string,
    params?: { division?: string; serviceCategory?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.division) query.set("division", params.division);
    if (params?.serviceCategory) query.set("serviceCategory", params.serviceCategory);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const queryStr = query.toString();
    return baseFetch<AvailableJobsResponse>(
      `/orders/technician/jobs/available${queryStr ? `?${queryStr}` : ""}`,
      { token }
    );
  },

  // Get job details
  getJobDetails: (id: string, token: string) =>
    baseFetch<{ success: boolean; data: Job }>(
      `/orders/technician/jobs/${id}`,
      { token }
    ),

  // Accept a job
  acceptJob: (id: string, token: string) =>
    baseFetch<{ success: boolean; data: Job; message: string }>(
      `/orders/technician/jobs/${id}/accept`,
      { method: "POST", token }
    ),

  // Reject a job
  rejectJob: (id: string, reason: string, token: string) =>
    baseFetch<{ success: boolean; message: string }>(
      `/orders/technician/jobs/${id}/reject`,
      { method: "POST", body: JSON.stringify({ reason }), token }
    ),

  // Start a job
  startJob: (id: string, token: string) =>
    baseFetch<{ success: boolean; data: Job; message: string }>(
      `/orders/technician/jobs/${id}/start`,
      { method: "POST", token }
    ),

  // Complete a job
  completeJob: (id: string, notes: string | undefined, token: string) =>
    baseFetch<{ success: boolean; data: Job; message: string }>(
      `/orders/technician/jobs/${id}/complete`,
      { method: "POST", body: JSON.stringify({ notes }), token }
    ),

  // Get schedule
  getSchedule: (token: string) =>
    baseFetch<{ success: boolean; data: { availability: TechnicianSchedule[]; upcomingJobs: Array<{id:string;bookingId:string;serviceName:string;scheduledDate:string;scheduledTime:string;address:string}> } }>(
      "/orders/technician/schedule",
      { token }
    ),

  // Update schedule
  updateSchedule: (availability: TechnicianSchedule[], token: string) =>
    baseFetch<{ success: boolean; message: string }>(
      "/orders/technician/schedule",
      { method: "PUT", body: JSON.stringify({ availability }), token }
    ),

  // Get earnings
  getEarnings: (period: "week" | "month" | "year", token: string) =>
    baseFetch<{ success: boolean; data: EarningsData }>(
      `/orders/technician/earnings?period=${period}`,
      { token }
    ),

  // Get earnings history
  getEarningsHistory: (token: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const queryStr = query.toString();
    return baseFetch<{
      success: boolean;
      data: EarningsHistoryItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/orders/technician/earnings/history${queryStr ? `?${queryStr}` : ""}`, { token });
  },

  // Get stats
  getStats: (token: string) =>
    baseFetch<{ success: boolean; data: TechnicianStats }>(
      "/orders/technician/stats",
      { token }
    ),

  // Sync profile - creates/updates technician profile in orders service
  syncProfile: (
    data: { firstName: string; lastName: string; phone?: string },
    token: string
  ) =>
    baseFetch<{ success: boolean; data: TechnicianProfile; message: string }>(
      "/orders/technician/profile/sync",
      { method: "POST", body: JSON.stringify(data), token }
    ),

  // Get profile
  getProfile: (token: string) =>
    baseFetch<{ success: boolean; data: TechnicianProfile }>(
      "/orders/technician/profile",
      { token }
    ),

  // Update profile
  updateProfile: (
    data: { phone?: string; serviceAreas?: string[]; specializations?: string[]; isAvailable?: boolean },
    token: string
  ) =>
    baseFetch<{ success: boolean; data: TechnicianProfile; message: string }>(
      "/orders/technician/profile",
      { method: "PATCH", body: JSON.stringify(data), token }
    ),
};
