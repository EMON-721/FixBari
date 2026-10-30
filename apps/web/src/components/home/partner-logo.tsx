import { Building2 } from "lucide-react";

// Color variants for visual interest
const colorVariants = [
  "bg-blue-50 text-blue-600",
  "bg-green-50 text-green-600",
  "bg-purple-50 text-purple-600",
  "bg-orange-50 text-orange-600",
  "bg-cyan-50 text-cyan-600",
  "bg-rose-50 text-rose-600",
];

interface PartnerLogoProps {
  name: string;
  index?: number;
  className?: string;
}

export function PartnerLogo({ name, index = 0, className = "" }: PartnerLogoProps) {
  const colorClass = colorVariants[index % colorVariants.length];

  return (
    <div
      className={`
        group flex items-center justify-center p-4
        bg-white rounded-2xl border border-gray-100
        hover:border-gray-200 hover:shadow-md
        transition-all duration-300 ease-out
        ${className}
      `}
      role="listitem"
    >
      <div className="flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Building2 className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium text-gray-700 text-center">
          {name}
        </span>
      </div>
    </div>
  );
}
