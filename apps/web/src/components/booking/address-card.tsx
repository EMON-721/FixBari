import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@local-services/ui";
import { MapPin, Building2, Map, Hash, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { BookingFormData } from "@/types/booking";
import { DIVISIONS } from "@/config/divisions";

interface AddressCardProps {
  register: UseFormRegister<BookingFormData>;
  errors: FieldErrors<BookingFormData>;
}

export function AddressCard({ register, errors }: AddressCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Delivery Address</h3>
          <p className="text-sm text-gray-500">Where should we come?</p>
        </div>
      </div>

      {/* Area & City Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Area */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            Area
          </label>
          <Input
            type="text"
            placeholder="e.g., Dhanmondi"
            className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
            {...register("area")}
          />
          {errors.area && (
            <p className="mt-1.5 text-sm text-red-500">{errors.area.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            City
          </label>
          <Input
            type="text"
            placeholder="e.g., Dhaka"
            className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
            {...register("city")}
          />
          {errors.city && (
            <p className="mt-1.5 text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>
      </div>

      {/* Division & Postal Code Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Division */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Map className="w-4 h-4 text-gray-400" />
            Division
          </label>
          <select
            className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
            {...register("division")}
          >
            <option value="">Select</option>
            {DIVISIONS.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
          {errors.division && (
            <p className="mt-1.5 text-sm text-red-500">{errors.division.message}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 text-gray-400" />
            Postal Code
          </label>
          <Input
            type="text"
            placeholder="e.g., 1205"
            className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
            {...register("postalCode")}
          />
          {errors.postalCode && (
            <p className="mt-1.5 text-sm text-red-500">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 text-gray-400" />
          Additional Notes
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <Textarea
          placeholder="Any special instructions, landmarks, or additional details..."
          className="bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors min-h-[100px]"
          {...register("additionalInfo")}
        />
      </div>
    </div>
  );
}
