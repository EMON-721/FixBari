import Link from "next/link";
import { ArrowLeft, ExternalLink, Plus, Mail, CreditCard, Banknote } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { AnimatedCheckIcon, BookingSuccessCard } from "@/components/booking";
import type { BookingResult, BookingStatus, PaymentMethod } from "@/types/booking";

interface BookingSuccessPageProps {
  searchParams: Promise<{
    bookingId?: string;
    service?: string;
    tier?: string;
    price?: string;
    date?: string;
    time?: string;
    address?: string;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  }>;
}

export default async function BookingSuccessPage({
  searchParams,
}: BookingSuccessPageProps) {
  const params = await searchParams;

  const booking: BookingResult = {
    bookingId: params.bookingId || "BK-UNKNOWN",
    serviceName: params.service || "Service",
    tierName: params.tier || "Standard",
    totalPrice: Number(params.price) || 0,
    date: params.date || new Date().toLocaleDateString(),
    time: params.time || "10:00 AM",
    address: params.address || "Address not specified",
    status: (params.status as BookingStatus) || "pending",
  };

  const paymentMethod = (params.paymentMethod as PaymentMethod) || "COD";
  const paymentStatus = params.paymentStatus || "PENDING";
  const isOnlinePayment = paymentMethod === "ONLINE";
  const isPaymentCompleted = paymentStatus === "COMPLETED";
  const isPaymentPending = isOnlinePayment && paymentStatus === "PENDING";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Success Content */}
          <div className="text-center mb-8">
            {/* Animated Check Icon */}
            <div className="mb-6">
              <AnimatedCheckIcon size="lg" />
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Your booking has been successfully placed. We&apos;ll contact you
              shortly to confirm the details.
            </p>
          </div>

          {/* Booking Card */}
          <div className="mb-8">
            <BookingSuccessCard booking={booking} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={`/bookings/${booking.bookingId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              View Booking
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Book Another Service
            </Link>
          </div>

          {/* Payment Info Banner */}
          <div className="max-w-md mx-auto mb-4">
            <div className={`${
              isPaymentCompleted
                ? "bg-green-50 border-green-100"
                : isPaymentPending
                  ? "bg-orange-50 border-orange-100"
                  : "bg-amber-50 border-amber-100"
            } border rounded-xl p-4 flex items-start gap-3`}>
              <div className={`w-8 h-8 rounded-full ${
                isPaymentCompleted
                  ? "bg-green-100"
                  : isPaymentPending
                    ? "bg-orange-100"
                    : "bg-amber-100"
              } flex items-center justify-center flex-shrink-0`}>
                {isPaymentCompleted ? (
                  <CreditCard className="w-4 h-4 text-green-600" />
                ) : isPaymentPending ? (
                  <CreditCard className="w-4 h-4 text-orange-600" />
                ) : (
                  <Banknote className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <p className={`${
                  isPaymentCompleted
                    ? "text-green-900"
                    : isPaymentPending
                      ? "text-orange-900"
                      : "text-amber-900"
                } font-medium text-sm`}>
                  {isPaymentCompleted
                    ? "Payment completed"
                    : isPaymentPending
                      ? "Payment pending"
                      : "Cash on Delivery"}
                </p>
                <p className={`${
                  isPaymentCompleted
                    ? "text-green-700"
                    : isPaymentPending
                      ? "text-orange-700"
                      : "text-amber-700"
                } text-sm`}>
                  {isPaymentCompleted
                    ? "Your payment has been successfully processed."
                    : isPaymentPending
                      ? "Please complete your payment to confirm the booking."
                      : "Please pay the service provider when the work is completed."}
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="max-w-md mx-auto">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-900 font-medium text-sm">
                  Confirmation email sent
                </p>
                <p className="text-blue-700 text-sm">
                  Check your inbox for booking details and updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
