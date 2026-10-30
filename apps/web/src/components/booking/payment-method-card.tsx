"use client";

import { CreditCard, Wallet, Shield } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { BookingFormData } from "@/types/booking";

interface PaymentMethodCardProps {
  register: UseFormRegister<BookingFormData>;
  errors: FieldErrors<BookingFormData>;
  selectedMethod: "ONLINE" | "COD";
}

export function PaymentMethodCard({
  register,
  errors,
  selectedMethod,
}: PaymentMethodCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Payment Method</h3>
          <p className="text-sm text-gray-500">Choose how you want to pay</p>
        </div>
      </div>

      {/* Payment Options */}
      <div className="pt-4 space-y-3">
        {/* Online Payment */}
        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMethod === "ONLINE"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            {...register("paymentMethod")}
            value="ONLINE"
            className="mt-1 h-4 w-4 text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-900">Pay Online</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pay securely with Card, bKash, Nagad, Rocket, or Internet Banking
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-1 bg-blue-100 rounded text-xs font-medium text-blue-700">
                Visa
              </span>
              <span className="px-2 py-1 bg-orange-100 rounded text-xs font-medium text-orange-700">
                Mastercard
              </span>
              <span className="px-2 py-1 bg-pink-100 rounded text-xs font-medium text-pink-700">
                bKash
              </span>
              <span className="px-2 py-1 bg-orange-100 rounded text-xs font-medium text-orange-700">
                Nagad
              </span>
              <span className="px-2 py-1 bg-purple-100 rounded text-xs font-medium text-purple-700">
                Rocket
              </span>
            </div>
          </div>
        </label>

        {/* Cash on Delivery */}
        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMethod === "COD"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            {...register("paymentMethod")}
            value="COD"
            className="mt-1 h-4 w-4 text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Cash on Delivery</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pay in cash when the service is completed
            </p>
          </div>
        </label>

        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-2">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>

      {/* Security Badge */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secured by SSLCOMMERZ - Bangladesh&apos;s trusted payment gateway</span>
        </div>
      </div>
    </div>
  );
}
