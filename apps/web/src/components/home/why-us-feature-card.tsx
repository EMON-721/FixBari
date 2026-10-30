import type { LucideIcon } from "lucide-react";

// Color variants for visual interest
const colorVariants = [
  { bg: "bg-primary/10", icon: "text-primary", border: "border-primary/20" },
  { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100" },
  { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
  { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100" },
  { bg: "bg-cyan-50", icon: "text-cyan-500", border: "border-cyan-100" },
  { bg: "bg-rose-50", icon: "text-rose-500", border: "border-rose-100" },
  { bg: "bg-indigo-50", icon: "text-indigo-500", border: "border-indigo-100" },
  { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
];

interface WhyUsFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index?: number;
  className?: string;
}

export function WhyUsFeatureCard({
  title,
  description,
  icon: Icon,
  index = 0,
  className = "",
}: WhyUsFeatureCardProps) {
  const defaultColors = { bg: "bg-primary/10", icon: "text-primary", border: "border-primary/20" };
  const colors = colorVariants[index % colorVariants.length] || defaultColors;

  return (
    <div
      className={`
        group relative flex flex-col
        p-6 sm:p-8 bg-white rounded-2xl
        border border-gray-100 hover:border-gray-200
        hover:shadow-xl transition-all duration-300 ease-out
        ${className}
      `}
      role="listitem"
    >
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>

      {/* Hover accent line */}
      <div className={`absolute bottom-0 left-6 right-6 h-1 ${colors.bg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}
