"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Star,
  Wallet,
  Loader2,
} from "lucide-react";
import { StatsCard, BookingCard, ReviewCard } from "@/components/dashboard";
import { useBookings, useBookingStats } from "@/hooks/use-bookings";

// Map API status to UI status (handles both uppercase and lowercase)
function mapApiStatusToUi(status: string): "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" {
  const normalizedStatus = status.toLowerCase().replace("_", "-");
  if (normalizedStatus === "assigned") return "confirmed";
  if (["pending", "confirmed", "in-progress", "completed", "cancelled"].includes(normalizedStatus)) {
    return normalizedStatus as "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  }
  return "pending";
}

export function DashboardContent() {
  const { bookings, isLoading: bookingsLoading } = useBookings({ limit: 3 });
  const { stats, isLoading: statsLoading } = useBookingStats();

  const isLoading = bookingsLoading || statsLoading;

  const statsData = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarDays,
      color: "primary" as const,
    },
    {
      title: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "green" as const,
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "amber" as const,
    },
    {
      title: "Total Spent",
      value: stats?.totalSpent ? `${stats.totalSpent.toLocaleString()} tk` : "0 tk",
      icon: Wallet,
      color: "blue" as const,
    },
  ];

  // Transform bookings to the format expected by BookingCard
  const recentBookings = bookings.map((booking) => ({
    id: booking.id,
    bookingId: booking.bookingId,
    serviceName: booking.serviceName,
    tierName: booking.tierName,
    date: booking.date,
    time: booking.time,
    address: booking.address,
    totalPrice: booking.totalPrice,
    status: mapApiStatusToUi(booking.status),
    technicianName: booking.technician?.name,
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Stats Grid */}
      <section>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/services"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">Book Service</span>
          </Link>
          <Link
            href="/dashboard/bookings"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">My Bookings</span>
          </Link>
          <Link
            href="/dashboard/reviews"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">My Reviews</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">View Profile</span>
          </Link>
        </div>
      </section>

      {/* Recent Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {bookingsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No bookings yet. Book your first service!</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        )}
      </section>

      {/* Recent Reviews - keeping static for now as reviews API is not implemented */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
          <Link
            href="/dashboard/reviews"
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Your reviews will appear here after completing bookings.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
