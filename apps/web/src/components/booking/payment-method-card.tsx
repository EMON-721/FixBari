"use client";

import { Wallet, ShieldCheck } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { BookingFormData } from "@/types/booking";

interface PaymentMethodCardProps {
  register: UseFormRegister<BookingFormData>;
  errors: FieldErrors<BookingFormData>;
  selectedMethod: "ONLINE" | "COD";
}

export function PaymentMethodCard({ register, errors }: PaymentMethodCardProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b pb-4">
        <Wallet className="h-6 w-6 text-primary" />
        <div>
          <h3 className="font-semibold text-gray-900">Payment method</h3>
          <p className="text-sm text-gray-500">Online payment is not available yet</p>
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
        <input type="radio" value="COD" {...register("paymentMethod")} defaultChecked className="mt-1" />
        <span>
          <span className="block font-semibold text-gray-900">Cash on Delivery (COD)</span>
          <span className="mt-1 block text-sm text-gray-600">
            Submit your booking now. Pay the service provider in cash only after the work is completed.
          </span>
        </span>
      </label>
      {errors.paymentMethod && <p role="alert" className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>}
      <p className="mt-4 flex items-center gap-2 text-xs text-gray-600">
        <ShieldCheck className="h-4 w-4 text-green-700" />
        No online card or mobile-wallet payment is collected at booking.
      </p>
    </section>
  );
}
