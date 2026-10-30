import { Star } from "lucide-react";
import { cn } from "@local-services/ui";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  variant?: "default" | "light";
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  variant = "default",
  className = "",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const stars = Array.from({ length: maxRating }, (_, i) => {
    const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
    return { index: i, fill: fillPercentage };
  });

  const emptyStarColor = variant === "light" ? "text-white/30" : "text-gray-300";
  const filledStarColor = variant === "light" ? "text-white fill-white" : "text-primary fill-primary";
  const valueColor = variant === "light" ? "text-white/80" : "text-gray-600";

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map(({ index, fill }) => (
        <div key={index} className="relative">
          {/* Empty star (background) */}
          <Star className={cn(sizeClasses[size], emptyStarColor)} />
          {/* Filled star (overlay) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fill}%` }}
          >
            <Star className={cn(sizeClasses[size], filledStarColor)} />
          </div>
        </div>
      ))}
      {showValue && (
        <span className={cn("ml-1 text-sm", valueColor)}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
