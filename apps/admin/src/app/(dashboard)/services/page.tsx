"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  FolderOpen,
  Settings,
} from "lucide-react";
import {
  useServices,
  useCategories,
  useToggleServiceActive,
  useDeleteService,
  useDeleteCategory,
  useToggleCategoryActive,
} from "@/hooks/use-services";
import { ServiceFormModal } from "@/components/services/service-form-modal";
import { CategoryFormModal } from "@/components/services/category-form-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Service, ServiceCategory } from "@/lib/api";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(
    null
  );
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<ServiceCategory | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const { data: services, isLoading: servicesLoading } = useServices({
    includeInactive: true,
    includeCategory: true,
  });
  const { data: categories, isLoading: categoriesLoading } = useCategories({
    includeInactive: true,
  });

  const toggleServiceActive = useToggleServiceActive();
  const deleteService = useDeleteService();
  const toggleCategoryActive = useToggleCategoryActive();
  const deleteCategory = useDeleteCategory();

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services?.filter((s) => s.categoryId === selectedCategory);

  const handleToggleServiceActive = async (service: Service) => {
    await toggleServiceActive.mutateAsync(service.id);
  };

  const handleDeleteService = async () => {
    if (deletingService) {
      await deleteService.mutateAsync(deletingService.id);
      setDeletingService(null);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleToggleCategoryActive = async (category: ServiceCategory) => {
    await toggleCategoryActive.mutateAsync(category.id);
  };

  const handleDeleteCategory = async () => {
    if (deletingCategory) {
      await deleteCategory.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  if (servicesLoading || categoriesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-14 lg:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage service categories and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Categories
          </button>
          <button
            onClick={() => setShowServiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Category Manager (Collapsible) */}
      {showCategoryManager && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Category
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories?.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-4 border rounded-xl ${
                  category.isActive
                    ? "border-gray-200 bg-white"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      {category._count?.services || 0} services
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleCategoryActive(category)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={toggleCategoryActive.isPending}
                  >
                    {category.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(category)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={(category._count?.services || 0) > 0}
                    title={
                      (category._count?.services || 0) > 0
                        ? "Cannot delete category with services"
                        : "Delete category"
                    }
                  >
                    <Trash2
                      className={`w-4 h-4 ${
                        (category._count?.services || 0) > 0
                          ? "text-gray-300"
                          : "text-red-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          All ({services?.length || 0})
        </button>
        {categories?.map((category) => {
          const count =
            services?.filter((s) => s.categoryId === category.id).length || 0;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {category.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {!filteredServices?.length ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory === "all"
              ? "Get started by adding your first service."
              : "No services in this category."}
          </p>
          <button
            onClick={() => setShowServiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices?.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border ${
                service.isActive
                  ? "border-gray-200"
                  : "border-gray-200 opacity-60"
              } p-6 hover:shadow-lg transition-all`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className="text-sm text-gray-500">
                    {service.category?.name}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleServiceActive(service)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={toggleServiceActive.isPending}
                >
                  {service.isActive ? (
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Description */}
              {service.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Base Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    ৳{Number(service.basePrice).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {service.duration >= 60
                      ? `${Math.floor(service.duration / 60)}h ${
                          service.duration % 60 > 0
                            ? `${service.duration % 60}m`
                            : ""
                        }`
                      : `${service.duration}m`}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeletingService(service)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ServiceFormModal
        open={showServiceModal}
        onClose={handleCloseServiceModal}
        service={editingService}
        categories={categories || []}
      />

      <CategoryFormModal
        open={showCategoryModal}
        onClose={handleCloseCategoryModal}
        category={editingCategory}
      />

      <ConfirmDialog
        open={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={handleDeleteService}
        title="Delete Service"
        description={`Are you sure you want to delete "${deletingService?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteService.isPending}
      />

      <ConfirmDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
