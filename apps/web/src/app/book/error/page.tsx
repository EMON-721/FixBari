import Link from "next/link";
import { ArrowLeft, RotateCcw, Home, Phone } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { BookingErrorCard } from "@/components/booking";
import type { BookingErrorData } from "@/types/booking";

interface BookingErrorPageProps {
  searchParams: Promise<{
    type?: string;
    message?: string;
    details?: string;
    serviceId?: string;
  }>;
}

export default async function BookingErrorPage({
  searchParams,
}: BookingErrorPageProps) {
  const params = await searchParams;

  const error: BookingErrorData = {
    type: (params.type as BookingErrorData["type"]) || "unknown",
    message: params.message || "An unexpected error occurred while processing your booking.",
    details: params.details,
    serviceId: params.serviceId,
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

          {/* Error Content */}
          <div className="py-8">
            <BookingErrorCard error={error} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-10">
            {error.serviceId && (
              <Link
                href={`/book?serviceId=${error.serviceId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
            <a
              href="tel:+8801700000000"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <Phone className="w-4 h-4" />
              Contact Support
            </a>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Need immediate help? Call us at{" "}
              <a
                href="tel:+8801700000000"
                className="text-primary font-medium hover:underline"
              >
                +880 1700 000 000
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
