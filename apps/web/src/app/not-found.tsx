import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Header, Footer } from "@/components/layout";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          {/* 404 Text */}
          <div className="mb-8">
            <h1 className="text-[120px] sm:text-[160px] font-bold text-gray-200 leading-none select-none">
              404
            </h1>
            <div className="relative -mt-12 sm:-mt-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Page Not Found
              </h2>
              <p className="text-gray-600">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
                It might have been moved or doesn&apos;t exist.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4" />
              Browse Services
            </Link>
          </div>

          {/* Decorative Element */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a
                href="tel:+8801700000000"
                className="text-primary font-medium hover:underline"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
