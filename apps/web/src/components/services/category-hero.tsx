import Link from "next/link";
import { ChevronRight, Star, Shield, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Category-specific gradient colors
const categoryGradients: Record<string, { from: string; via: string; to: string; accent: string }> = {
  "home-repair": { from: "from-orange-500", via: "via-orange-600", to: "to-amber-700", accent: "bg-orange-400" },
  "cleaning": { from: "from-blue-500", via: "via-blue-600", to: "to-cyan-700", accent: "bg-blue-400" },
  "electrical": { from: "from-yellow-500", via: "via-amber-600", to: "to-orange-700", accent: "bg-yellow-400" },
  "painting": { from: "from-rose-500", via: "via-pink-600", to: "to-purple-700", accent: "bg-rose-400" },
  "plumbing": { from: "from-cyan-500", via: "via-teal-600", to: "to-blue-700", accent: "bg-cyan-400" },
  "transport": { from: "from-green-500", via: "via-emerald-600", to: "to-teal-700", accent: "bg-green-400" },
};

const defaultGradient = { from: "from-primary", via: "via-primary", to: "to-amber-600", accent: "bg-primary" };

interface CategoryHeroProps {
  name: string;
  nameLocal?: string;
  slug: string;
  icon: LucideIcon;
  description?: string;
  serviceCount?: number;
  className?: string;
}

export function CategoryHero({
  name,
  nameLocal,
  slug,
  icon: Icon,
  description,
  serviceCount = 0,
  className = "",
}: CategoryHeroProps) {
  const gradient = categoryGradients[slug] || defaultGradient;

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} py-12 sm:py-16 lg:py-20 ${className}`}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/70 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#services" className="hover:text-white transition-colors">
            Services
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium">{name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Category badge */}
            <div className={`inline-flex items-center gap-2 ${gradient.accent} rounded-full px-4 py-1.5 mb-6`}>
              <Icon className="w-4 h-4 text-white" strokeWidth={2} />
              <span className="text-white text-sm font-medium">{name} Services</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Professional {name}
              {nameLocal && (
                <span className="block text-white/80 text-xl sm:text-2xl lg:text-3xl font-normal mt-2">
                  {nameLocal}
                </span>
              )}
            </h1>

            {description && (
              <p className="text-white/80 text-lg max-w-xl mb-8">
                {description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Verified Pros</p>
                  <p className="text-white/70 text-sm">Background checked</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">4.8+ Rating</p>
                  <p className="text-white/70 text-sm">Highly rated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Same Day</p>
                  <p className="text-white/70 text-sm">Quick service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Icon display */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-64 h-64 rounded-full border-2 border-white/20 flex items-center justify-center">
                {/* Inner ring */}
                <div className="w-48 h-48 rounded-full border-2 border-white/30 flex items-center justify-center">
                  {/* Icon circle */}
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              {serviceCount > 0 && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
                  <p className="text-gray-900 font-semibold text-sm">{serviceCount} Services Available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="#f9fafb" />
        </svg>
      </div>
    </section>
  );
}
