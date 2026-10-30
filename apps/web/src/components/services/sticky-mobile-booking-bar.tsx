import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

interface StickyMobileBookingBarProps {
  price: number;
  serviceId: string;
  rating?: number;
}

export function StickyMobileBookingBar({
  price,
  serviceId,
  rating = 4.8,
}: StickyMobileBookingBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50">
      {/* Gradient shadow overlay */}
      <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Bar content */}
      <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)] safe-area-bottom">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Left: Price & Rating */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-2xl font-bold text-gray-900">
                ৳{price.toLocaleString()}
              </p>
              <span className="text-sm text-gray-400">onwards</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">• Available today</span>
            </div>
          </div>

          {/* Right: Book Button */}
          <Link
            href={`/book?service=${serviceId}`}
            className="inline-flex items-center gap-2 py-3.5 px-6 text-base font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg"
          >
            Book Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
