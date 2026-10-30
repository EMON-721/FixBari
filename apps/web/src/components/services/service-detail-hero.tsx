import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Clock, Shield, CheckCircle, Users, ArrowRight, Phone } from "lucide-react";
import { StarRating } from "./star-rating";

// Category-specific gradient colors
const categoryGradients: Record<string, { from: string; via: string; to: string }> = {
  "home-repair": { from: "from-orange-500", via: "via-orange-600", to: "to-amber-700" },
  "cleaning": { from: "from-blue-500", via: "via-blue-600", to: "to-cyan-700" },
  "electrical": { from: "from-yellow-500", via: "via-amber-600", to: "to-orange-700" },
  "painting": { from: "from-rose-500", via: "via-pink-600", to: "to-purple-700" },
  "plumbing": { from: "from-cyan-500", via: "via-teal-600", to: "to-blue-700" },
  "transport": { from: "from-green-500", via: "via-emerald-600", to: "to-teal-700" },
};

const defaultGradient = { from: "from-primary", via: "via-primary", to: "to-amber-600" };

interface ServiceDetailHeroProps {
  serviceName: string;
  serviceNameLocal?: string;
  serviceIcon: LucideIcon;
  serviceId: string;
  categoryName: string;
  categorySlug: string;
  rating: number;
  ratingCount: number;
  duration?: string;
  price: number;
}

export function ServiceDetailHero({
  serviceName,
  serviceNameLocal,
  serviceIcon: Icon,
  serviceId,
  categoryName,
  categorySlug,
  rating,
  ratingCount,
  duration,
  price,
}: ServiceDetailHeroProps) {
  const gradient = categoryGradients[categorySlug] || defaultGradient;

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Breadcrumbs */}
        <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-white/70">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li>
              <Link
                href={`/services/${categorySlug}`}
                className="hover:text-white transition-colors"
              >
                {categoryName}
              </Link>
            </li>
            <ChevronRight className="w-4 h-4" />
            <li className="text-white font-medium truncate max-w-[150px] sm:max-w-none">
              {serviceName}
            </li>
          </ol>
        </nav>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Left: Service Info (3 cols) */}
          <div className="lg:col-span-3">
            <div className="flex items-start gap-5 mb-6">
              {/* Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center bg-white/20 rounded-2xl backdrop-blur-sm">
                <Icon
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                  strokeWidth={1.5}
                />
              </div>

              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                  {serviceName}
                </h1>
                {serviceNameLocal && (
                  <p className="text-white/70 text-lg mb-3">{serviceNameLocal}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating} size="md" variant="light" />
                    <span className="text-white/80 text-sm">
                      {rating.toFixed(1)} ({ratingCount} reviews)
                    </span>
                  </div>
                  {duration && (
                    <div className="flex items-center gap-1.5 text-white/80 bg-white/10 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Verified</p>
                  <p className="text-white/60 text-xs">Background checked</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Guaranteed</p>
                  <p className="text-white/60 text-xs">100% satisfaction</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Expert Team</p>
                  <p className="text-white/60 text-xs">Skilled professionals</p>
                </div>
              </div>
            </div>

            {/* Quick contact */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:+8801700000000"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">Need help? Call +880 1700-000000</span>
              </a>
            </div>
          </div>

          {/* Right: Price Card (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Service Price</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Available Today
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-1">Starting from</p>
                  <p className="text-4xl sm:text-5xl font-bold text-gray-900">
                    ৳{price.toLocaleString()}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Professional service included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Quality materials & equipment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Free cancellation up to 24h</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/book?service=${serviceId}`}
                  className="flex w-full items-center justify-center gap-2 py-4 px-6 text-lg font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all group"
                >
                  Book Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-center text-xs text-gray-400 mt-4">
                  No payment required to book
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
