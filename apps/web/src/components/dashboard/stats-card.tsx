import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "green" | "blue" | "amber" | "purple";
}

const colorStyles = {
  primary: { bg: "bg-primary/10", icon: "text-primary" },
  green: { bg: "bg-green-50", icon: "text-green-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${styles.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${styles.icon}`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
