import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

// Color schemes for different categories
const categoryColors: Record<string, { bg: string; icon: string; hover: string }> = {
  painting: { bg: "bg-orange-50", icon: "text-orange-500", hover: "group-hover:bg-orange-100" },
  cleaning: { bg: "bg-blue-50", icon: "text-blue-500", hover: "group-hover:bg-blue-100" },
  electrical: { bg: "bg-yellow-50", icon: "text-yellow-600", hover: "group-hover:bg-yellow-100" },
  plumbing: { bg: "bg-cyan-50", icon: "text-cyan-500", hover: "group-hover:bg-cyan-100" },
  "home-repair": { bg: "bg-green-50", icon: "text-green-500", hover: "group-hover:bg-green-100" },
  transport: { bg: "bg-purple-50", icon: "text-purple-500", hover: "group-hover:bg-purple-100" },
};

interface ServiceCategoryCardProps {
  name: string;
  icon: LucideIcon;
  slug: string;
  description?: string;
  className?: string;
}

export function ServiceCategoryCard({
  name,
  icon: Icon,
  slug,
  description,
  className = "",
}: ServiceCategoryCardProps) {
  const colors = categoryColors[slug] || { bg: "bg-primary/10", icon: "text-primary", hover: "group-hover:bg-primary/20" };

  return (
    <Link
      href={`/services/${slug}`}
      className={`
        group relative flex flex-col
        p-6 bg-white rounded-2xl border border-gray-100
        hover:border-gray-200 hover:shadow-lg
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${className}
      `}
      aria-label={`View ${name} services`}
    >
      {/* Icon Container */}
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${colors.bg} ${colors.hover} flex items-center justify-center mb-4 transition-colors duration-300`}>
        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${colors.icon}`} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
        {name}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
      )}

      {/* Arrow indicator */}
      <div className="flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-primary mt-auto pt-2 transition-colors">
        <span>View Services</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
