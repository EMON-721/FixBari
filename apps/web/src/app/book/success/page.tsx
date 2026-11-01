import Link from "next/link";
import { ArrowLeft, ExternalLink, Plus, Mail, Banknote } from "lucide-react";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { AnimatedCheckIcon, BookingSuccessCard } from "@/components/booking";
import type { BookingResult, BookingStatus } from "@/types/booking";

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
  if (!/^BK-[A-Z0-9]{6}$/.test(params.bookingId || "")) redirect("/dashboard/bookings");

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
              Booking Request Received
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Your request was saved. It is pending admin review and technician assignment.
              No advance payment has been collected.
            </p>
          </div>

          {/* Booking Card */}
          <div className="mb-8">
            <BookingSuccessCard booking={booking} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={`/dashboard/bookings/${booking.bookingId}`}
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

          {/* COD policy and account history */}
          <div className="mx-auto max-w-md space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <Banknote className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Cash on Delivery</p>
                <p className="text-sm text-amber-800">
                  Pay in cash after service completion. Booking payment is pending; no card or wallet payment is required now.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" />
              <p className="text-sm text-blue-800">
                Track your real booking status in My Bookings. Email delivery is not guaranteed until notifications are configured.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
