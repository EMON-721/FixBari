import Link from "next/link";
import { ArrowLeft, XCircle, RefreshCw, HelpCircle } from "lucide-react";
import { Header, Footer } from "@/components/layout";

interface PaymentFailedPageProps {
  searchParams: Promise<{
    tran_id?: string;
    message?: string;
  }>;
}

export default async function PaymentFailedPage({
  searchParams,
}: PaymentFailedPageProps) {
  const params = await searchParams;
  const tranId = params.tran_id;
  const message = params.message;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50 to-white">
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
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {message || "Your payment could not be processed. Please try again or use a different payment method."}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-8">
              <XCircle className="w-4 h-4" />
              Payment Failed
            </div>

            {/* Common Reasons */}
            <div className="text-left bg-amber-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-amber-800 mb-2">Common reasons for payment failure:</h3>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>Insufficient balance in your account</li>
                <li>Card/account details entered incorrectly</li>
                <li>Transaction declined by your bank</li>
                <li>Payment session timed out</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/dashboard/bookings"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Payment
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <HelpCircle className="w-4 h-4" />
              Need help? Contact our support team
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
