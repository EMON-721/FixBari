import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { SubService } from "@/types/sub-service";
import { ServiceCard } from "./service-card";

interface RelatedServicesSectionProps {
  services: SubService[];
  currentServiceId: string;
  categorySlug: string;
}

export function RelatedServicesSection({
  services,
  currentServiceId,
  categorySlug,
}: RelatedServicesSectionProps) {
  const relatedServices = services.filter(
    (service) => service.id !== currentServiceId
  );

  if (relatedServices.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              More Options
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Related Services
            </h2>
            <p className="text-gray-600 mt-2">
              Explore other services you might be interested in
            </p>
          </div>
          <Link
            href={`/services/${categorySlug}`}
            className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-primary transition-colors group"
          >
            View all services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile: Horizontal Scroll with scroll indicators */}
        <div className="sm:hidden">
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {relatedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex-shrink-0 w-[300px] snap-start"
                >
                  <ServiceCard
                    id={service.id}
                    name={service.name}
                    slug={service.slug}
                    categorySlug={categorySlug}
                    icon={service.icon}
                    price={service.price}
                    rating={service.rating}
                  />
                </div>
              ))}
            </div>
            {/* Scroll hint */}
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm">
              <ChevronLeft className="w-4 h-4" />
              <span>Swipe to see more</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tablet & Desktop: Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedServices.slice(0, 3).map((service) => (
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

        {/* Bottom CTA */}
        {relatedServices.length > 3 && (
          <div className="hidden sm:flex justify-center mt-10">
            <Link
              href={`/services/${categorySlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              View All {services.length} Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
