"use client";

import { useState, useEffect, useCallback } from "react";
import { jobsApi, type JobListItem, type AvailableJob, type Job, type TechnicianStats, type EarningsData, type TechnicianSchedule } from "@/lib/api";
import { storage } from "@/lib/storage";

// Hook for assigned jobs
export function useAssignedJobs(params?: { status?: "assigned" | "in_progress"; date?: string }) {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.getAssignedJobs(token, params);
      setJobs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  }, [params?.status, params?.date]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, isLoading, error, refetch: fetchJobs };
}

// Hook for available jobs
export function useAvailableJobs(params?: { division?: string; serviceCategory?: string }) {
  const [jobs, setJobs] = useState<AvailableJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.getAvailableJobs(token, params);
      setJobs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch available jobs");
    } finally {
      setIsLoading(false);
    }
  }, [params?.division, params?.serviceCategory]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, isLoading, error, refetch: fetchJobs };
}

// Hook for job details
export function useJobDetails(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.getJobDetails(jobId, token);
      setJob(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job details");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, isLoading, error, refetch: fetchJob };
}

// Hook for job actions
export function useJobActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptJob = useCallback(async (jobId: string) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.acceptJob(jobId, token);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept job");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectJob = useCallback(async (jobId: string, reason: string) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await jobsApi.rejectJob(jobId, reason, token);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject job");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startJob = useCallback(async (jobId: string) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.startJob(jobId, token);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start job");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeJob = useCallback(async (jobId: string, notes?: string) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.completeJob(jobId, notes, token);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete job");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { acceptJob, rejectJob, startJob, completeJob, isLoading, error };
}

// Hook for technician stats
export function useTechnicianStats() {
  const [stats, setStats] = useState<TechnicianStats | null>(null);
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
        const response = await jobsApi.getStats(token);
        setStats(response.data);
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

// Hook for earnings
export function useEarnings(period: "week" | "month" | "year") {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        const response = await jobsApi.getEarnings(period, token);
        setEarnings(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch earnings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEarnings();
  }, [period]);

  return { earnings, isLoading, error };
}

// Hook for schedule
export function useSchedule() {
  const [schedule, setSchedule] = useState<TechnicianSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await jobsApi.getSchedule(token);
      setSchedule(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch schedule");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSchedule = useCallback(async (availability: TechnicianSchedule[]) => {
    const token = storage.getAccessToken();
    if (!token) {
      setError("Not authenticated");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await jobsApi.updateSchedule(availability, token);
      setSchedule(availability);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update schedule");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { schedule, isLoading, error, refetch: fetchSchedule, updateSchedule };
}
