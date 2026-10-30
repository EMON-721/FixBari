import { Receipt, CheckCircle, X, Shield, Clock, Star, CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/types/booking";

interface PriceDetailsCardProps {
  totalPrice: number;
  basePrice: number;
  tierName: string;
  serviceName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  paymentMethod?: PaymentMethod;
}

export function PriceDetailsCard({
  totalPrice,
  basePrice,
  tierName,
  serviceName,
  isSubmitting,
  onCancel,
  paymentMethod = "COD",
}: PriceDetailsCardProps) {
  const getButtonText = () => {
    if (isSubmitting) return "Processing...";
    if (paymentMethod === "ONLINE") return "Proceed to Payment";
    return "Confirm Booking";
  };

  const ButtonIcon = paymentMethod === "ONLINE" ? CreditCard : CheckCircle;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
          <p className="text-sm text-gray-500">Review your booking</p>
        </div>
      </div>

      {/* Service Info */}
      <div className="py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Service</p>
        <p className="font-medium text-gray-900">{serviceName}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
          {tierName} Package
        </span>
      </div>

      {/* Price Breakdown */}
      <div className="py-4 space-y-3 flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Base Price</span>
          <span className="text-gray-700">{basePrice.toLocaleString()} tk</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Package ({tierName})</span>
          <span className="text-gray-700">
            {tierName === "Standard" ? "Included" : `+${(totalPrice - basePrice).toLocaleString()} tk`}
          </span>
        </div>
        <div className="pt-3 border-t border-dashed border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary">
              {totalPrice.toLocaleString()} tk
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-4 border-t border-gray-100 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center text-center">
          <Shield className="w-5 h-5 text-green-500 mb-1" />
          <span className="text-xs text-gray-500">Secure</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Clock className="w-5 h-5 text-blue-500 mb-1" />
          <span className="text-xs text-gray-500">On-time</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Star className="w-5 h-5 text-yellow-500 mb-1" />
          <span className="text-xs text-gray-500">Top Rated</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 text-base font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <ButtonIcon className="w-5 h-5" />
          {getButtonText()}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full py-3 px-6 text-base font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
