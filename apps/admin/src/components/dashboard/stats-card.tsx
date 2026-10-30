import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: "primary" | "green" | "blue" | "amber" | "purple" | "red";
}

const colorStyles = {
  primary: { bg: "bg-primary/10", icon: "text-primary", trend: "text-primary" },
  green: { bg: "bg-green-50", icon: "text-green-600", trend: "text-green-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", trend: "text-blue-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", trend: "text-amber-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", trend: "text-purple-600" },
  red: { bg: "bg-red-50", icon: "text-red-600", trend: "text-red-600" },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "primary",
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${styles.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${styles.icon}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
              trend.isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            <svg
              className={`w-3 h-3 ${trend.isPositive ? "" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
