"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { useCreateService, useUpdateService } from "@/hooks/use-services";
import type { Service, ServiceCategory } from "@/lib/api";

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  icon: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Price must be positive"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  categories: ServiceCategory[];
}

export function ServiceFormModal({
  open,
  onClose,
  service,
  categories,
}: ServiceFormModalProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      icon: "",
      basePrice: 0,
      duration: 60,
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        categoryId: service.categoryId,
        description: service.description || "",
        icon: service.icon || "",
        basePrice: Number(service.basePrice),
        duration: service.duration,
        isActive: service.isActive,
        sortOrder: service.sortOrder,
      });
    } else {
      reset({
        name: "",
        categoryId: categories[0]?.id || "",
        description: "",
        icon: "",
        basePrice: 0,
        duration: 60,
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [service, categories, reset, open]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (service) {
        await updateService.mutateAsync({ id: service.id, data });
      } else {
        await createService.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save service:", error);
    }
  };

  if (!open) return null;

  const isPending = createService.isPending || updateService.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? "Edit Service" : "Add Service"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField label="Service Name" error={errors.name?.message} required>
            <input
              {...register("name")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g., Deep Cleaning"
            />
          </FormField>

          <FormField
            label="Category"
            error={errors.categoryId?.message}
            required
          >
            <select
              {...register("categoryId")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Service description..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Base Price (৳)"
              error={errors.basePrice?.message}
              required
            >
              <input
                type="number"
                {...register("basePrice")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0"
              />
            </FormField>

            <FormField
              label="Duration (min)"
              error={errors.duration?.message}
              required
            >
              <input
                type="number"
                {...register("duration")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="60"
              />
            </FormField>
          </div>

          <FormField label="Icon (Lucide name)" error={errors.icon?.message}>
            <input
              {...register("icon")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="e.g., Sparkles"
            />
          </FormField>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {service ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
