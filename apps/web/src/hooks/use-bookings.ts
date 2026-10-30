"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingsApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import type {
  BookingListItem,
  BookingDetail,
  BookingListResponse,
  AddReviewData,
} from "@/types/booking";

interface UseBookingsOptions {
  page?: number;
  limit?: number;
  status?: string;
}

interface UseBookingsReturn {
  bookings: BookingListItem[];
  pagination: BookingListResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [pagination, setPagination] = useState<BookingListResponse["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingsApi.list(token, options);
      setBookings(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    pagination,
    isLoading,
    error,
    refetch: fetchBookings,
  };
}

interface UseBookingDetailReturn {
  booking: BookingDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBookingDetail(bookingId: string): UseBookingDetailReturn {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingsApi.getDetails(bookingId, token);
      setBooking(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch booking details");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, fetchBooking]);

  return {
    booking,
    isLoading,
    error,
    refetch: fetchBooking,
  };
}

interface UseBookingActionsReturn {
  cancelBooking: (bookingId: string, reason: string) => Promise<boolean>;
  addReview: (bookingId: string, data: AddReviewData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useBookingActions(): UseBookingActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await bookingsApi.cancel(bookingId, reason, token);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addReview = useCallback(async (bookingId: string, data: AddReviewData) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await bookingsApi.addReview(bookingId, data, token);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add review");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cancelBooking,
    addReview,
    isLoading,
    error,
  };
}

interface BookingStats {
  totalBookings: number;
  completed: number;
  pending: number;
  totalSpent: number;
}

interface UseBookingStatsReturn {
  stats: BookingStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useBookingStats(): UseBookingStatsReturn {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all bookings to calculate stats
        const response = await bookingsApi.list(token, { limit: 100 });
        const bookings = response.data;

        const totalSpent = bookings
          .filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + b.totalPrice, 0);

        setStats({
          totalBookings: response.pagination.total,
          completed: bookings.filter((b) => b.status === "completed").length,
          pending: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
          totalSpent,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
