import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StarRating } from "./star-rating";

// Category-specific colors for service cards
const categoryColors: Record<string, { bg: string; iconBg: string; icon: string; accent: string }> = {
  "home-repair": { bg: "bg-orange-50", iconBg: "bg-orange-100", icon: "text-orange-600", accent: "border-orange-200" },
  "cleaning": { bg: "bg-blue-50", iconBg: "bg-blue-100", icon: "text-blue-600", accent: "border-blue-200" },
  "electrical": { bg: "bg-yellow-50", iconBg: "bg-amber-100", icon: "text-amber-600", accent: "border-amber-200" },
  "painting": { bg: "bg-rose-50", iconBg: "bg-rose-100", icon: "text-rose-600", accent: "border-rose-200" },
  "plumbing": { bg: "bg-cyan-50", iconBg: "bg-cyan-100", icon: "text-cyan-600", accent: "border-cyan-200" },
  "transport": { bg: "bg-green-50", iconBg: "bg-green-100", icon: "text-green-600", accent: "border-green-200" },
};

const defaultColors = { bg: "bg-primary/5", iconBg: "bg-primary/10", icon: "text-primary", accent: "border-primary/20" };

interface ServiceCardProps {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  icon: LucideIcon;
  price: number;
  rating: number;
  reviewCount?: number;
  className?: string;
}

export function ServiceCard({
  id,
  name,
  slug,
  categorySlug,
  icon: Icon,
  price,
  rating,
  reviewCount = 24,
  className = "",
}: ServiceCardProps) {
  const colors = categoryColors[categorySlug] || defaultColors;

  return (
    <div
      className={`
        group relative bg-white rounded-2xl
        border border-gray-100 hover:border-gray-200
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        overflow-hidden
        ${className}
      `}
    >
      {/* Top colored section */}
      <div className={`${colors.bg} p-6 pb-8`}>
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`w-14 h-14 ${colors.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={1.5} />
          </div>
          {/* Price badge */}
          <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm">
            <p className="text-xs text-gray-500">Starting at</p>
            <p className="text-lg font-bold text-gray-900">৳{price.toLocaleString()}</p>
          </div>
        </div>

        {/* Service name */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={rating} size="sm" />
          <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
        </div>
      </div>

      {/* Bottom white section */}
      <div className="p-6 pt-4">
        {/* Quick info */}
        <div className="flex items-center gap-4 mb-5 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Same day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Verified pros</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href={`/services/${categorySlug}/${slug}`}
            className={`flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-center`}
          >
            View Details
          </Link>
          <Link
            href={`/book?service=${id}`}
            className="flex-1 py-3 px-4 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all text-center inline-flex items-center justify-center gap-2 group/btn"
          >
            Book Now
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Hover accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}
