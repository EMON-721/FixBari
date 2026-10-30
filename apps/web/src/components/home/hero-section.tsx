"use client";

import Image from "next/image";
import { Star, Users, CheckCircle } from "lucide-react";
import { SearchBar } from "./search-bar";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center min-h-[480px] lg:min-h-[540px] py-12 lg:py-0">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left py-8 lg:py-16 z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white text-sm font-medium">
                FIXBARI · HOME SERVICES
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Home services,
              <span className="block mt-2 text-amber-400">
                made simple.
              </span>
            </h1>

            <p className="text-slate-200 text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
              Connect with verified professionals for painting, cleaning,
              electrical, plumbing, and more. Quality service, guaranteed.
            </p>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar placeholder="What service do you need?" />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-lg">Local</p>
                  <p className="text-slate-300 text-sm">Service Pros</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-lg">Simple</p>
                  <p className="text-white/70 text-sm">Booking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-lg">Safe</p>
                  <p className="text-white/70 text-sm">Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:block flex-1 relative h-[550px]">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Image Container with decorative elements */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/auth-worker.png"
                  alt="Professional service worker"
                  fill
                  className="object-contain object-bottom"
                  priority
                  sizes="(min-width: 1024px) 50vw, 0vw"
                />

                {/* Floating Card 1 */}
                <div className="absolute top-20 right-0 bg-white rounded-2xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Local Professionals</p>
                      <p className="text-sm text-gray-500">Explore available services</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-32 left-0 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Home Service</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
