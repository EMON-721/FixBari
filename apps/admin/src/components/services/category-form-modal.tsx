"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-services";
import type { ServiceCategory } from "@/lib/api";

const featureSchema = z.object({
  text: z.string().min(1, "Feature text is required"),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
});

const stepSchema = z.object({
  stepNumber: z.number().min(1),
  title: z.string().min(1, "Step title is required"),
  description: z.string().min(1, "Step description is required"),
});

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  features: z.array(featureSchema).optional(),
  steps: z.array(stepSchema).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: ServiceCategory | null;
}

export function CategoryFormModal({
  open,
  onClose,
  category,
}: CategoryFormModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      isActive: true,
      sortOrder: 0,
      features: [],
      steps: [],
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "features",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        features:
          category.features?.map((f) => ({
            text: f.text,
            icon: f.icon || "",
            sortOrder: f.sortOrder,
          })) || [],
        steps:
          category.steps?.map((s) => ({
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
          })) || [],
      });
    } else {
      reset({
        name: "",
        description: "",
        icon: "",
        isActive: true,
        sortOrder: 0,
        features: [],
        steps: [],
      });
    }
  }, [category, reset, open]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  if (!open) return null;

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 my-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <FormField
              label="Category Name"
              error={errors.name?.message}
              required
            >
              <input
                {...register("name")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Cleaning"
              />
            </FormField>

            <FormField label="Description" error={errors.description?.message}>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Category description..."
              />
            </FormField>

            <FormField label="Icon (Lucide name)" error={errors.icon?.message}>
              <input
                {...register("icon")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Sparkles, Wrench, Paintbrush"
              />
            </FormField>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="categoryIsActive"
                {...register("isActive")}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="categoryIsActive" className="text-sm text-gray-700">
                Active (visible in listings)
              </label>
            </div>
          </div>

          {/* What's Included Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                What&apos;s Included
              </h3>
              <button
                type="button"
                onClick={() =>
                  appendFeature({ text: "", icon: "", sortOrder: featureFields.length })
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>

            {featureFields.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No features added yet. Click &quot;Add Feature&quot; to add one.
              </p>
            ) : (
              <div className="space-y-3">
                {featureFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        {...register(`features.${index}.text`)}
                        placeholder="Feature text (e.g., Professional equipment)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        {...register(`features.${index}.icon`)}
                        placeholder="Icon name (optional, e.g., Shield)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How It Works Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">How It Works</h3>
              <button
                type="button"
                onClick={() =>
                  appendStep({
                    stepNumber: stepFields.length + 1,
                    title: "",
                    description: "",
                  })
                }
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {stepFields.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No steps added yet. Click &quot;Add Step&quot; to add one.
              </p>
            ) : (
              <div className="space-y-3">
                {stepFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="hidden"
                      {...register(`steps.${index}.stepNumber`, {
                        valueAsNumber: true,
                      })}
                      value={index + 1}
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        {...register(`steps.${index}.title`)}
                        placeholder="Step title (e.g., Book Service)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        {...register(`steps.${index}.description`)}
                        placeholder="Step description"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
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
              {category ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
