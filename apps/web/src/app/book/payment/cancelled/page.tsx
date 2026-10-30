import Link from "next/link";
import { ArrowLeft, XCircle, AlertCircle, Home, RefreshCw } from "lucide-react";
import { Header, Footer } from "@/components/layout";

interface PaymentCancelledPageProps {
  searchParams: Promise<{
    tran_id?: string;
    message?: string;
  }>;
}

export default async function PaymentCancelledPage({
  searchParams,
}: PaymentCancelledPageProps) {
  const params = await searchParams;
  const tranId = params.tran_id;
  const message = params.message;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            {/* Cancelled Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 mb-6">
              {message || "You cancelled the payment process. Your booking has not been confirmed."}
            </p>

            {/* Transaction Info */}
            {tranId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-600">
                  Reference: <span className="font-mono font-medium text-gray-900">{tranId}</span>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
              <AlertCircle className="w-4 h-4" />
              Payment Cancelled
            </div>

            {/* Info Message */}
            <div className="text-left bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">What happens now?</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>No payment has been charged to your account</li>
                <li>Your booking reservation has been released</li>
                <li>You can try booking again anytime</li>
                <li>Choose Cash-on-Delivery if you prefer to pay later</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/dashboard/bookings"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Changed your mind? You can always book again or choose to pay with Cash-on-Delivery.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
