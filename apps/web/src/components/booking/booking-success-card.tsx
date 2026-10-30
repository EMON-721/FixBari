import { Tag, Calendar, MapPin, Receipt, Clock } from "lucide-react";
import type { BookingResult, BookingStatus } from "@/types/booking";

interface BookingSuccessCardProps {
  booking: BookingResult;
}

const statusStyles: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
  "in-progress": { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
  completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export function BookingSuccessCard({ booking }: BookingSuccessCardProps) {
  const status = statusStyles[booking.status] || statusStyles.pending;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Booking ID
          </p>
          <p className="text-lg font-bold text-gray-900 font-mono">
            {booking.bookingId}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        {/* Service */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">
              Service
            </p>
            <p className="text-gray-900 font-semibold">{booking.serviceName}</p>
            <p className="text-sm text-gray-500">{booking.tierName} Package</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">
              Schedule
            </p>
            <p className="text-gray-900 font-semibold">{booking.date}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{booking.time}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">
              Address
            </p>
            <p className="text-gray-900 font-semibold">{booking.address}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">
              Total Price
            </p>
            <p className="text-gray-900 font-bold text-xl">
              {booking.totalPrice.toLocaleString()} tk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
