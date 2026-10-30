"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  servicesApi,
  type Service,
  type ServiceCategory,
  type CreateServiceInput,
  type UpdateServiceInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/api";
import { storage } from "@/lib/storage";

// Helper to get token
function getToken(): string | null {
  return storage.getAccessToken();
}

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: object) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (filters?: object) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  byCategory: (categoryId: string) =>
    [...serviceKeys.lists(), "byCategory", categoryId] as const,
};

// Category Hooks
export function useCategories(params?: {
  includeInactive?: boolean;
  includeServices?: boolean;
}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => servicesApi.getCategories(params, getToken() || undefined),
  });
}

export function useCategory(
  id: string,
  params?: { includeServices?: boolean }
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () =>
      servicesApi.getCategory(id, params, getToken() || undefined),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.createCategory(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.updateCategory(id, data, token);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.deleteCategory(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
    },
  });
}

export function useToggleCategoryActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.toggleCategoryActive(id, token);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
    },
  });
}

// Service Hooks
export function useServices(params?: {
  includeInactive?: boolean;
  includeCategory?: boolean;
}) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => servicesApi.getServices(params, getToken() || undefined),
  });
}

export function useServicesByCategory(
  categoryId: string,
  params?: { includeInactive?: boolean }
) {
  return useQuery({
    queryKey: serviceKeys.byCategory(categoryId),
    queryFn: () =>
      servicesApi.getServicesByCategory(
        categoryId,
        params,
        getToken() || undefined
      ),
    enabled: !!categoryId,
  });
}

export function useService(id: string, params?: { includeCategory?: boolean }) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => servicesApi.getService(id, params, getToken() || undefined),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.createService(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceInput }) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.updateService(id, data, token);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.deleteService(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return servicesApi.toggleServiceActive(id, token);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(id) });
    },
  });
}
