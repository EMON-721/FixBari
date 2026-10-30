import { AlertTriangle, ServerCrash, WifiOff, AlertCircle } from "lucide-react";
import type { BookingErrorData } from "@/types/booking";

interface BookingErrorCardProps {
  error: BookingErrorData;
}

const errorStyles = {
  validation: {
    icon: AlertTriangle,
    bg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Validation Error",
  },
  server: {
    icon: ServerCrash,
    bg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Server Error",
  },
  network: {
    icon: WifiOff,
    bg: "bg-gray-100",
    iconColor: "text-gray-600",
    title: "Connection Error",
  },
  unknown: {
    icon: AlertCircle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Something Went Wrong",
  },
};

export function BookingErrorCard({ error }: BookingErrorCardProps) {
  const style = errorStyles[error.type] || errorStyles.unknown;
  const Icon = style.icon;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* Error Icon */}
      <div className="relative flex items-center justify-center mb-6">
        <div
          className={`w-20 h-20 ${style.bg} rounded-full flex items-center justify-center animate-scale-in`}
        >
          <Icon className={`w-10 h-10 ${style.iconColor}`} strokeWidth={1.5} />
        </div>
      </div>

      {/* Error Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        {style.title}
      </h1>

      {/* Error Message */}
      <p className="text-gray-600 mb-4 max-w-sm mx-auto">{error.message}</p>

      {/* Error Details */}
      {error.details && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-left">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
            Technical Details
          </p>
          <p className="text-sm text-gray-700 font-mono">{error.details}</p>
        </div>
      )}
    </div>
  );
}
