"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@local-services/ui";
import {
  CalendarDays,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { jobsApi, type JobListItem, type JobStatus } from "@/lib/api";
import { storage } from "@/lib/storage";

type FilterStatus = "all" | "assigned" | "in_progress";

const statusConfig: Record<
  JobStatus,
  { label: string; bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  ASSIGNED: {
    label: "Assigned",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: PlayCircle,
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle2,
  },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function BookingsPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["technician-jobs", filter],
    queryFn: async () => {
      const token = storage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const params =
        filter === "all"
          ? {}
          : { status: filter as "assigned" | "in_progress" };
      return jobsApi.getAssignedJobs(token, params);
    },
  });

  const startJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const token = storage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return jobsApi.startJob(jobId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technician-jobs"] });
    },
  });

  const completeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const token = storage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return jobsApi.completeJob(jobId, undefined, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technician-jobs"] });
    },
  });

  const jobs = data?.data || [];

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          My Bookings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your assigned and in-progress jobs
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "assigned", "in_progress"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === status
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {status === "all"
              ? "All"
              : status === "assigned"
              ? "Assigned"
              : "In Progress"}
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Bookings
            {data?.pagination && (
              <span className="text-sm font-normal text-slate-500">
                ({data.pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Failed to load bookings. Please try again.
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No bookings found.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: JobListItem) => {
                const status = statusConfig[job.status];
                const StatusIcon = status?.icon || AlertCircle;

                return (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-slate-500">
                          {job.bookingId}
                        </span>
                        {status && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        )}
                        {job.urgency === "urgent" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-slate-900 mb-1">
                        {job.serviceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.address.fullAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(job.scheduledDate)} -{" "}
                          {job.scheduledTime || "TBD"}
                        </span>
                      </div>
                      <p className="text-emerald-600 font-semibold mt-2">
                        ৳{job.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      <Link href={`/dashboard/bookings/${job.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Details
                        </Button>
                      </Link>
                      {job.status === "ASSIGNED" && (
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 w-full"
                          onClick={() => startJobMutation.mutate(job.id)}
                          disabled={startJobMutation.isPending}
                        >
                          {startJobMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Start Job"
                          )}
                        </Button>
                      )}
                      {job.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 w-full"
                          onClick={() => completeJobMutation.mutate(job.id)}
                          disabled={completeJobMutation.isPending}
                        >
                          {completeJobMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Complete"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
