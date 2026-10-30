"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@local-services/ui";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { jobsApi, type JobStatus } from "@/lib/api";
import { storage } from "@/lib/storage";

const statusConfig: Record<
  JobStatus,
  { label: string; bg: string; text: string }
> = {
  ASSIGNED: { label: "Assigned", bg: "bg-blue-100", text: "text-blue-700" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-amber-100", text: "text-amber-700" },
  COMPLETED: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = params.id as string;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      const token = storage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const response = await jobsApi.getJobDetails(jobId, token);
      return response.data;
    },
    enabled: !!jobId,
  });

  const completeJobMutation = useMutation({
    mutationFn: async () => {
      const token = storage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return jobsApi.completeJob(jobId, completionNotes || undefined, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["technician-jobs"] });
      setShowCompleteConfirm(false);
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: async () => {
      const token = storage.getAccessToken();
      if (!token) throw new Error("Not authenticated");
      // Use reject endpoint with a cancellation reason
      return jobsApi.rejectJob(jobId, "Cancelled by technician", token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-detail", jobId] });
      queryClient.invalidateQueries({ queryKey: ["technician-jobs"] });
      setShowCancelConfirm(false);
      router.push("/dashboard/bookings");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load job details.</p>
          <Link href="/dashboard/bookings">
            <Button variant="outline">Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[job.status as JobStatus];
  const canChangeStatus = job.status === "IN_PROGRESS";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {job.bookingId}
              </h1>
              {status && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}
                >
                  {status.label}
                </span>
              )}
            </div>
            <p className="text-slate-500">{job.serviceName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">
              ৳{job.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Schedule & Location */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Schedule & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">
                  {formatDate(job.scheduledDate)}
                </p>
                <p className="text-sm text-slate-500">Scheduled Date</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">
                  {job.scheduledTime || "TBD"}
                </p>
                <p className="text-sm text-slate-500">Scheduled Time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">
                  {job.address.fullAddress}
                </p>
                <p className="text-sm text-slate-500">
                  {job.address.area}, {job.address.city}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">{job.customer.name}</p>
                <p className="text-sm text-slate-500">Customer Name</p>
              </div>
            </div>
            {job.customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">{job.customer.phone}</p>
                  <p className="text-sm text-slate-500">Phone Number</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        {(job.additionalInfo || job.notes) && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.additionalInfo && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Customer Notes</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {job.additionalInfo}
                    </p>
                  </div>
                </div>
              )}
              {job.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Job Notes</p>
                    <p className="text-sm text-slate-600 mt-1">{job.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Actions - Only show for IN_PROGRESS jobs */}
        {canChangeStatus && (
          <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-lg">Update Job Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                This job is currently in progress. You can mark it as completed
                or cancel it if needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 flex-1"
                  onClick={() => setShowCompleteConfirm(true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Job
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Status Info */}
        {job.status === "COMPLETED" && (
          <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-medium">This job has been completed.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Status Info */}
        {job.status === "ASSIGNED" && (
          <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 text-blue-700">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">
                  Start this job first before you can complete or cancel it.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Complete Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to mark this job as completed? This action
                cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Completion Notes (optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Any notes about the completed work..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCompleteConfirm(false)}
                  disabled={completeJobMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => completeJobMutation.mutate()}
                  disabled={completeJobMutation.isPending}
                >
                  {completeJobMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm Complete"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Cancel Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to cancel this job? This action cannot be
                undone and may affect your rating.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelJobMutation.isPending}
                >
                  Go Back
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => cancelJobMutation.mutate()}
                  disabled={cancelJobMutation.isPending}
                >
                  {cancelJobMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Yes, Cancel Job"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
