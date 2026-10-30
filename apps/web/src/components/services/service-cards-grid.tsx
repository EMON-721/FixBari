import { Grid3X3, List, Search } from "lucide-react";
import type { SubService } from "@/types/sub-service";
import { ServiceCard } from "./service-card";

interface ServiceCardsGridProps {
  services: SubService[];
  categorySlug: string;
  categoryName?: string;
  className?: string;
}

export function ServiceCardsGrid({
  services,
  categorySlug,
  categoryName = "Services",
  className = "",
}: ServiceCardsGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
        <p className="text-gray-500">No services are available in this category yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Available {categoryName} Services
          </h2>
          <p className="text-gray-500 mt-1">
            {services.length} professional {services.length === 1 ? 'service' : 'services'} to choose from
          </p>
        </div>

        {/* View toggle (decorative for now) */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button
            className="p-2.5 rounded-lg bg-white shadow-sm text-gray-900"
            aria-label="Grid view"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            className="p-2.5 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Services grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label="Available services"
      >
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            name={service.name}
            slug={service.slug}
            categorySlug={categorySlug}
            icon={service.icon}
            price={service.price}
            rating={service.rating}
          />
        ))}
      </div>

      {/* Bottom trust banner */}
      <div className="mt-12 p-6 bg-gray-900 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-medium"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-semibold">500+ Verified Professionals</p>
              <p className="text-gray-400 text-sm">Ready to help with your {categoryName.toLowerCase()} needs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Quality Guaranteed</span>
            </div>
            <span className="text-gray-600">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
