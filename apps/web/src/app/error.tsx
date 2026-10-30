"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            FixBari
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-scale-in">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. An unexpected error occurred.
            Please try again or contact support if the problem persists.
          </p>

          {/* Error Digest */}
          {error.digest && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-6">
              <p className="text-xs text-gray-500">
                Error ID: <code className="font-mono">{error.digest}</code>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a
                href="tel:+8801700000000"
                className="text-primary font-medium hover:underline"
              >
                Call +880 1700 000 000
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
