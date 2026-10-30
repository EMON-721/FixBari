"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Package,
  User,
  Phone,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  FileText,
  Ruler,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard";
import { useBookingDetail, useBookingActions } from "@/hooks/use-bookings";
import type { BookingStatus } from "@/types/booking";

const statusConfig: Record<
  BookingStatus,
  { bg: string; text: string; icon: React.ElementType; label: string; iconBg: string }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: AlertCircle,
    label: "Pending",
    iconBg: "bg-amber-100",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: CheckCircle2,
    label: "Confirmed",
    iconBg: "bg-blue-100",
  },
  "in-progress": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: Loader2,
    label: "In Progress",
    iconBg: "bg-purple-100",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: CheckCircle2,
    label: "Completed",
    iconBg: "bg-green-100",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: XCircle,
    label: "Cancelled",
    iconBg: "bg-red-100",
  },
};

function mapApiStatusToUi(status: string): BookingStatus {
  const normalizedStatus = status.toLowerCase().replace("_", "-");
  if (normalizedStatus === "assigned") return "confirmed";
  if (["pending", "confirmed", "in-progress", "completed", "cancelled"].includes(normalizedStatus)) {
    return normalizedStatus as BookingStatus;
  }
  return "pending";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const { booking, isLoading, error, refetch } = useBookingDetail(bookingId);
  const { cancelBooking, addReview, isLoading: actionLoading } = useBookingActions();

  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    const success = await cancelBooking(bookingId, cancelReason);
    if (success) {
      setShowCancelModal(false);
      setCancelReason("");
      refetch();
    }
  };

  const handleSubmitReview = async () => {
    const success = await addReview(bookingId, {
      rating: reviewRating,
      review: reviewText,
    });
    if (success) {
      setShowReviewModal(false);
      setReviewText("");
      refetch();
    }
  };

  if (isLoading) {
    return (
      <>
        <DashboardHeader title="Booking Details" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading booking details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <DashboardHeader title="Booking Details" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Not Found</h3>
            <p className="text-gray-500 mb-6">{error || "The booking you're looking for doesn't exist."}</p>
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </>
    );
  }

  const uiStatus = mapApiStatusToUi(booking.status);
  const status = statusConfig[uiStatus];
  const StatusIcon = status.icon;
  const canCancel = ["pending", "confirmed"].includes(uiStatus);
  const canReview = uiStatus === "completed" && booking.rating === null;
  const serviceName = booking.serviceName;

  return (
    <>
      <DashboardHeader title="Booking Details" />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className={`${status.bg} rounded-2xl p-6`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${status.iconBg} rounded-2xl flex items-center justify-center`}>
                  <StatusIcon className={`w-7 h-7 ${status.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className={`text-xl font-bold ${status.text}`}>{status.label}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border border-current/20`}>
                      {booking.bookingId}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {uiStatus === "pending" && "Your booking is waiting for confirmation."}
                    {uiStatus === "confirmed" && "Your booking has been confirmed. A technician will be assigned soon."}
                    {uiStatus === "in-progress" && "Your service is currently being performed."}
                    {uiStatus === "completed" && "Your service has been completed successfully."}
                    {uiStatus === "cancelled" && "This booking has been cancelled."}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Service Details</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{serviceName}</h4>
                    <p className="text-gray-500">{booking.tierName} Package</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Scheduled Date</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Scheduled Time</p>
                      <p className="font-medium text-gray-900">{booking.time}</p>
                    </div>
                  </div>
                  {booking.areaSize && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Ruler className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Area Size</p>
                        <p className="font-medium text-gray-900">{booking.areaSize}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Service Location</p>
                      <p className="font-medium text-gray-900">{booking.address}</p>
                    </div>
                  </div>
                </div>

                {booking.additionalInfo && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-700 font-medium mb-1">Additional Notes</p>
                        <p className="text-sm text-amber-900">{booking.additionalInfo}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technician Card */}
            {booking.technician && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Assigned Technician</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                      {booking.technician.avatar ? (
                        <img
                          src={booking.technician.avatar}
                          alt={booking.technician.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{booking.technician.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {booking.technician.rating.toFixed(1)}
                          </span>
                        </div>
                        {booking.technician.phone && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{booking.technician.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {booking.technician.phone && (
                      <a
                        href={`tel:${booking.technician.phone}`}
                        className="px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Review Section */}
            {booking.rating !== null && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Your Review</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= booking.rating!
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {booking.rating}/5
                    </span>
                  </div>
                  {booking.review && (
                    <p className="text-gray-600">{booking.review}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Price Summary</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="text-gray-900">{serviceName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Package</span>
                    <span className="text-gray-900">{booking.tierName}</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {booking.totalPrice.toLocaleString()} tk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Booking Info</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {booking.bookingId}
                    </code>
                    <button
                      onClick={handleCopyBookingId}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Booked On</p>
                  <p className="text-sm text-gray-900">{formatDateTime(booking.createdAt)}</p>
                </div>
                {booking.completedDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Completed On</p>
                    <p className="text-sm text-gray-900">{formatDateTime(booking.completedDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Service Address</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {canReview && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <Star className="w-5 h-5" />
                  Leave a Review
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Booking
                </button>
              )}
              <Link
                href="/services"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Book Another Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking</h3>
            <p className="text-gray-500 text-sm mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave a Review</h3>
            <p className="text-gray-500 text-sm mb-4">
              How was your experience with this service?
            </p>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= reviewRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience (optional)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={4}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
