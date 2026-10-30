"use client";

import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@local-services/ui";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  ChevronRight,
  Wrench,
  Loader2,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useAssignedJobs, useAvailableJobs, useTechnicianStats, useEarnings, useJobActions } from "@/hooks/use-jobs";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (isTomorrow) return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DashboardContent() {
  const { user } = useAuth();
  const { jobs: assignedJobs, isLoading: assignedLoading, refetch: refetchAssigned } = useAssignedJobs();
  const { jobs: availableJobs, isLoading: availableLoading, refetch: refetchAvailable } = useAvailableJobs();
  const { stats, isLoading: statsLoading } = useTechnicianStats();
  const { earnings, isLoading: earningsLoading } = useEarnings("month");
  const { startJob, isLoading: actionLoading } = useJobActions();

  const isLoading = assignedLoading || statsLoading || earningsLoading;

  const handleStartJob = async (jobId: string) => {
    const result = await startJob(jobId);
    if (result) {
      refetchAssigned();
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          {greeting()}, {user?.firstName || "Technician"}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your jobs today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Today&apos;s Jobs
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {assignedJobs.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Jobs Completed
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stats?.completedJobs ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Earnings (MTD)
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      ৳{(earnings?.total ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Rating
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1 flex items-center gap-1">
                      {(stats?.rating ?? 0).toFixed(1)}
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Jobs - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Assigned Jobs</CardTitle>
                <CardDescription>Your scheduled jobs</CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="ghost" size="sm" className="text-emerald-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignedLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : assignedJobs.length > 0 ? (
                assignedJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
                        <Wrench className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{job.serviceName}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{job.address.fullAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{job.scheduledDate ? formatDate(job.scheduledDate) : "TBD"} - {job.scheduledTime || "TBD"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/bookings/${job.id}`}>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </Link>
                      {job.status === "ASSIGNED" && (
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handleStartJob(job.id)}
                          disabled={actionLoading}
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No assigned jobs at the moment
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Jobs */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Available Jobs Nearby</CardTitle>
                <CardDescription>Jobs matching your skills in your area</CardDescription>
              </div>
              <Link href="/dashboard/bookings?tab=available">
                <Button variant="ghost" size="sm" className="text-emerald-600">
                  Browse All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {availableLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : availableJobs.length > 0 ? (
                <div className="space-y-3">
                  {availableJobs.slice(0, 2).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border border-dashed border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{job.serviceName}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.address.division}
                          </span>
                          <span className="font-medium text-emerald-600">
                            ৳{job.estimatedEarnings.min.toLocaleString()} - ৳{job.estimatedEarnings.max.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {job.scheduledDate ? formatDate(job.scheduledDate) : "TBD"} - {job.scheduledTime || "TBD"}
                        </p>
                      </div>
                      <Link href={`/dashboard/bookings/${job.id}?action=accept`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No available jobs in your area
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/schedule">
                <Button className="w-full justify-start bg-emerald-500 hover:bg-emerald-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Update Availability
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Update Service Area
                </Button>
              </Link>
              <Link href="/dashboard/earnings">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Earnings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Total Jobs</span>
                    <span className="font-semibold text-slate-900">{stats?.totalJobs ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Completed</span>
                    <span className="font-semibold text-slate-900">{stats?.completedJobs ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Completion Rate</span>
                    <span className="font-semibold text-emerald-600">{stats?.completionRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Total Earnings</span>
                    <span className="font-semibold text-slate-900">
                      ৳{(stats?.totalEarnings ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
