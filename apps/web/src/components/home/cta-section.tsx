import Link from "next/link";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className = "" }: CTASectionProps) {
  return (
    <section
      aria-labelledby="cta-heading"
      className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20 lg:py-24 ${className}`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-medium">
              Available 7 days a week
            </span>
          </span>

          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform
            <span className="block text-primary">Your Home?</span>
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Book a service today and experience the convenience of having trusted
            professionals at your doorstep. Quality guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="
                group inline-flex items-center gap-2
                px-8 py-4 bg-primary text-white font-semibold rounded-xl
                hover:bg-primary/90 transition-all duration-300
                shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
              "
            >
              Book a Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="tel:+8801700000000"
              className="
                inline-flex items-center gap-2
                px-8 py-4 bg-white/10 text-white font-semibold rounded-xl
                border border-white/20 hover:bg-white/20 transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
              "
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Satisfaction Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
