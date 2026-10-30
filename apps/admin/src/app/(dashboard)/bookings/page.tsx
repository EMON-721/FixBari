"use client";

import { useState } from "react";
import { Plus, Download, Eye, Edit2, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, UserPlus } from "lucide-react";
import { DataTable } from "@/components/dashboard";
import { useOrders } from "@/hooks/use-orders";
import { AssignTechnicianModal } from "@/components/bookings/assign-technician-modal";
import type { OrderStatus, OrderListItem } from "@/lib/api";

const statusStyles: Record<OrderStatus, { bg: string; text: string; icon: typeof Clock; label: string }> = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle2, label: "Confirmed" },
  ASSIGNED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle2, label: "Assigned" },
  IN_PROGRESS: { bg: "bg-purple-100", text: "text-purple-700", icon: AlertCircle, label: "In Progress" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Completed" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Cancelled" },
};

const statusFilters: Array<"all" | OrderStatus> = ["all", "PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [assignModalBooking, setAssignModalBooking] = useState<OrderListItem | null>(null);
  const queryParams = statusFilter === "all" ? {} : { status: statusFilter };
  const { data, isLoading, error, refetch } = useOrders(queryParams);

  const bookings = data?.data || [];
  const pagination = data?.pagination;

  const canAssignTechnician = (status: OrderStatus) => {
    return status === "PENDING" || status === "CONFIRMED";
  };

  const columns = [
    {
      key: "bookingId",
      label: "Booking ID",
      render: (item: OrderListItem) => (
        <span className="font-mono text-sm font-medium text-gray-900">{item.bookingId}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (item: OrderListItem) => (
        <div>
          <p className="font-medium text-gray-900">{item.userName}</p>
        </div>
      ),
    },
    {
      key: "service",
      label: "Service",
      render: (item: OrderListItem) => (
        <span className="text-gray-900">{item.serviceName}</span>
      ),
    },
    {
      key: "technician",
      label: "Technician",
      render: (item: OrderListItem) => (
        item.technicianName ? (
          <span className="text-gray-900">{item.technicianName}</span>
        ) : canAssignTechnician(item.status) ? (
          <button
            onClick={() => setAssignModalBooking(item)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Assign
          </button>
        ) : (
          <span className="text-gray-400 italic">Unassigned</span>
        )
      ),
    },
    {
      key: "datetime",
      label: "Schedule",
      render: (item: OrderListItem) => (
        <div>
          <p className="text-gray-900">{formatDate(item.scheduledDate)}</p>
          <p className="text-sm text-gray-500">{item.scheduledTime}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (item: OrderListItem) => (
        <span className="font-semibold text-gray-900">৳{item.totalAmount.toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: OrderListItem) => {
        const status = statusStyles[item.status];
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-14 lg:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all service bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => {
            const label = status === "all" ? "All" : statusStyles[status]?.label || status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {label}
                {status === "all" && pagination && ` (${pagination.total})`}
              </button>
            );
          })}
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl">
            Failed to load bookings. Please try again.
          </div>
        ) : (
          <DataTable
            data={bookings}
            columns={columns}
            searchPlaceholder="Search bookings..."
            actions={(item) => (
              <div className="flex items-center justify-end gap-1">
                {canAssignTechnician(item.status) && !item.technicianName && (
                  <button
                    onClick={() => setAssignModalBooking(item)}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="Assign Technician"
                  >
                    <UserPlus className="w-4 h-4 text-primary" />
                  </button>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Assign Technician Modal */}
      {assignModalBooking && (
        <AssignTechnicianModal
          booking={assignModalBooking}
          onClose={() => setAssignModalBooking(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
