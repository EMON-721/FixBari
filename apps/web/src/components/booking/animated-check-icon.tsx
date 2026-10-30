import { CheckCircle2 } from "lucide-react";

interface AnimatedCheckIconProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { container: "w-16 h-16", icon: "w-8 h-8", ring: "w-20 h-20" },
  md: { container: "w-20 h-20", icon: "w-10 h-10", ring: "w-24 h-24" },
  lg: { container: "w-24 h-24", icon: "w-12 h-12", ring: "w-28 h-28" },
};

export function AnimatedCheckIcon({ size = "lg" }: AnimatedCheckIconProps) {
  const sizes = sizeClasses[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated pulse ring */}
      <div
        className={`absolute ${sizes.ring} bg-green-100 rounded-full animate-ping opacity-75`}
        style={{ animationDuration: "2s" }}
      />

      {/* Second pulse ring with delay */}
      <div
        className={`absolute ${sizes.ring} bg-green-50 rounded-full animate-ping opacity-50`}
        style={{ animationDuration: "2s", animationDelay: "0.5s" }}
      />

      {/* Main circle with scale animation */}
      <div
        className={`relative ${sizes.container} bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in`}
      >
        <CheckCircle2
          className={`${sizes.icon} text-white`}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
}
