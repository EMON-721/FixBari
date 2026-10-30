"use client";

import Link from "next/link";
import {
  Users,
  Wrench,
  CalendarDays,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard";
import { useOverviewStats, useOrders, useTopServices } from "@/hooks/use-orders";

const statusStyles = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle2, label: "Confirmed" },
  ASSIGNED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle2, label: "Assigned" },
  IN_PROGRESS: { bg: "bg-purple-100", text: "text-purple-700", icon: AlertCircle, label: "In Progress" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Completed" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Cancelled" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `৳${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `৳${(amount / 1000).toFixed(0)}K`;
  return `৳${amount.toLocaleString()}`;
}

export function DashboardOverview() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useOverviewStats();
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 5 });
  const { data: topServicesData, isLoading: topServicesLoading } = useTopServices(5);

  const isLoading = overviewLoading || ordersLoading || topServicesLoading;

  const stats = overview
    ? [
        {
          title: "Total Users",
          value: overview.totalUsers.toLocaleString(),
          icon: Users,
          color: "blue" as const,
          trend: undefined,
        },
        {
          title: "Total Technicians",
          value: overview.totalTechnicians.toLocaleString(),
          icon: Wrench,
          color: "purple" as const,
          trend: undefined,
        },
        {
          title: "Active Bookings",
          value: overview.activeBookings.toLocaleString(),
          icon: CalendarDays,
          color: "amber" as const,
          trend: { value: overview.trends.bookingsChange, isPositive: overview.trends.bookingsChange >= 0 },
        },
        {
          title: "Revenue (MTD)",
          value: formatCurrency(overview.revenueMTD),
          icon: DollarSign,
          color: "green" as const,
          trend: { value: overview.trends.revenueChange, isPositive: overview.trends.revenueChange >= 0 },
        },
      ]
    : [];

  const recentBookings = ordersData?.data || [];
  const topServices = topServicesData?.topByRevenue || [];

  if (overviewError) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="pl-14 lg:pl-0">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="space-y-8">
        {/* Stats Grid */}
        <section>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  trend={stat.trend}
                />
              ))}
            </div>
          )}
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                  <p className="text-sm text-gray-500">Latest booking activities</p>
                </div>
                <Link
                  href="/bookings"
                  className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentBookings.map((booking) => {
                    const status = statusStyles[booking.status] || statusStyles.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center`}>
                              <StatusIcon className={`w-5 h-5 ${status.text}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.serviceName}</p>
                              <p className="text-sm text-gray-500">{booking.userName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">৳{booking.totalAmount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500 font-mono">{booking.bookingId}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Technician:</span>
                            <span className="text-xs font-medium text-gray-700">
                              {booking.technicianName || "Unassigned"}
                            </span>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No bookings yet</div>
              )}
            </div>
          </section>

          {/* Top Services */}
          <section>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Services</h2>
                <p className="text-sm text-gray-500">This month's performance</p>
              </div>
              {topServicesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : topServices.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {topServices.map((service, index) => (
                    <div key={service.serviceId} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No data available</div>
              )}
              <div className="p-4 border-t border-gray-200">
                <Link
                  href="/services"
                  className="text-sm text-primary font-medium hover:underline flex items-center justify-center gap-1"
                >
                  View All Services <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/bookings"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <span className="font-medium text-gray-700">Manage Bookings</span>
            </Link>
            <Link
              href="/users"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">Manage Users</span>
            </Link>
            <Link
              href="/technicians"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Wrench className="w-7 h-7 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Manage Technicians</span>
            </Link>
            <Link
              href="/analytics"
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">View Analytics</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
