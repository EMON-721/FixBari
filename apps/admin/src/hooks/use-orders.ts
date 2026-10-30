"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ordersApi,
  type OrderQueryParams,
  type UpdateOrderInput,
} from "@/lib/api";
import { storage } from "@/lib/storage";

// Helper to get token
function getToken(): string | null {
  return storage.getAccessToken();
}

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: OrderQueryParams) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export const technicianKeys = {
  all: ["technicians"] as const,
  available: (params?: { division?: string; serviceCategory?: string }) =>
    [...technicianKeys.all, "available", params] as const,
  rankings: (limit: number) => [...technicianKeys.all, "rankings", limit] as const,
};

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
  revenue: (period: string) => [...analyticsKeys.all, "revenue", period] as const,
  topServices: (limit: number) => [...analyticsKeys.all, "topServices", limit] as const,
};

// Order Hooks
export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getOrders(params, token);
      return response;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getOrder(id, token);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderInput }) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return ordersApi.updateOrder(id, data, token);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return ordersApi.deleteOrder(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      technicianId,
    }: {
      orderId: string;
      technicianId: string;
    }) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return ordersApi.assignTechnician(orderId, technicianId, token);
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    },
  });
}

// Technician Hooks
export function useAvailableTechnicians(params?: {
  division?: string;
  serviceCategory?: string;
}) {
  return useQuery({
    queryKey: technicianKeys.available(params),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getAvailableTechnicians(params, token);
      return response.data;
    },
  });
}

export function useTechnicianRankings(limit: number = 10) {
  return useQuery({
    queryKey: technicianKeys.rankings(limit),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getTechnicianRankings(limit, token);
      return response.data;
    },
  });
}

// Analytics Hooks
export function useOverviewStats() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getOverviewStats(token);
      return response.data;
    },
  });
}

export function useRevenueAnalytics(period: "day" | "week" | "month" | "year") {
  return useQuery({
    queryKey: analyticsKeys.revenue(period),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getRevenueAnalytics(period, token);
      return response.data;
    },
  });
}

export function useTopServices(limit: number = 5) {
  return useQuery({
    queryKey: analyticsKeys.topServices(limit),
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const response = await ordersApi.getTopServices(limit, token);
      return response.data;
    },
  });
}
