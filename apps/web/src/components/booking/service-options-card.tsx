import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@local-services/ui";
import { Ruler, Layers, Calendar, Clock } from "lucide-react";
import type { BookingFormData } from "@/types/booking";
import { SERVICE_TIERS } from "@/config/service-tiers";

interface ServiceOptionsCardProps {
  register: UseFormRegister<BookingFormData>;
  errors: FieldErrors<BookingFormData>;
}

export function ServiceOptionsCard({
  register,
  errors,
}: ServiceOptionsCardProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Service Options</h3>
          <p className="text-sm text-gray-500">Configure your service</p>
        </div>
      </div>

      {/* Area Size */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Ruler className="w-4 h-4 text-gray-400" />
          Area Size
        </label>
        <Input
          type="text"
          placeholder="e.g., 1200 sq ft"
          className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
          {...register("areaSize")}
        />
        {errors.areaSize && (
          <p className="mt-1.5 text-sm text-red-500">{errors.areaSize.message}</p>
        )}
      </div>

      {/* Service Type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Layers className="w-4 h-4 text-gray-400" />
          Service Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SERVICE_TIERS.map((tier) => (
            <label
              key={tier.id}
              className="relative flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                value={tier.id}
                className="sr-only"
                {...register("tier")}
              />
              <span className="font-medium text-gray-900">{tier.name}</span>
              <span className="text-xs text-gray-500">
                {tier.multiplier === 1 ? "Base" : `${tier.multiplier}x`}
              </span>
            </label>
          ))}
        </div>
        {errors.tier && (
          <p className="mt-1.5 text-sm text-red-500">{errors.tier.message}</p>
        )}
      </div>

      {/* Schedule Section */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-4">
          <Calendar className="w-4 h-4 text-primary" />
          Schedule
        </h4>

        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              min={today}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
              {...register("date")}
            />
            {errors.date && (
              <p className="mt-1.5 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Time
            </label>
            <Input
              type="time"
              className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
              {...register("time")}
            />
            {errors.time && (
              <p className="mt-1.5 text-sm text-red-500">{errors.time.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
