"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Calendar, Clock, MapPin, User, ChevronRight, Package, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard";
import { useBookings } from "@/hooks/use-bookings";
import type { BookingStatus } from "@/types/booking";

const statusFilters = [
  { value: "all", label: "All Bookings" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  "in-progress": { bg: "bg-purple-100", text: "text-purple-700", label: "In Progress" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

// Map API status to UI status (handles both uppercase and lowercase)
function mapApiStatusToUi(status: string): BookingStatus {
  const normalizedStatus = status.toLowerCase().replace("_", "-");
  if (normalizedStatus === "assigned") return "confirmed";
  if (["pending", "confirmed", "in-progress", "completed", "cancelled"].includes(normalizedStatus)) {
    return normalizedStatus as BookingStatus;
  }
  return "pending";
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { bookings, isLoading, error } = useBookings();

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
      const uiStatus = mapApiStatusToUi(booking.status);
      const matchesStatus = statusFilter === "all" || uiStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <>
      <DashboardHeader
        title="My Bookings"
        description="View and manage all your service bookings"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white min-w-[180px]"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load bookings</h3>
            <p className="text-gray-500 mb-6">{error}</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const uiStatus = mapApiStatusToUi(booking.status);
              const status = statusStyles[uiStatus];
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
                        <span className="text-sm text-gray-400">|</span>
                        <span className="text-sm text-gray-500 font-mono">{booking.bookingId}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>{booking.tierName} Package</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{booking.time}</span>
                        </div>
                        {booking.technician?.name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{booking.technician.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total Price</p>
                        <p className="text-xl font-bold text-gray-900">
                          {booking.totalPrice.toLocaleString()} tk
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/bookings/${booking.bookingId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You haven't made any bookings yet"}
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
