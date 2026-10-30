import Link from "next/link";
import { Calendar, Clock, MapPin, MoreVertical, User } from "lucide-react";
import type { BookingStatus } from "@/types/booking";

interface BookingCardProps {
  booking: {
    id: string;
    bookingId: string;
    serviceName: string;
    tierName: string;
    date: string;
    time: string;
    address: string;
    totalPrice: number;
    status: BookingStatus;
    technicianName?: string;
  };
}

const statusStyles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  "in-progress": { bg: "bg-purple-100", text: "text-purple-700", label: "In Progress" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export function BookingCard({ booking }: BookingCardProps) {
  const status = statusStyles[booking.status] || statusStyles.pending;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{booking.tierName} Package</p>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2.5 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{booking.date}</span>
          <Clock className="w-4 h-4 text-gray-400 ml-2" />
          <span className="text-gray-600">{booking.time}</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <span className="text-gray-600 line-clamp-1">{booking.address}</span>
        </div>
        {booking.technicianName && (
          <div className="flex items-center gap-2.5 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{booking.technicianName}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Total Price</p>
          <p className="text-lg font-bold text-gray-900">{booking.totalPrice.toLocaleString()} tk</p>
        </div>
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
