import type { ServiceCategory } from "@/types/service";
import { ServiceCategoryCard } from "./service-category-card";

interface ServiceCategoriesGridProps {
  categories: ServiceCategory[];
  className?: string;
}

export function ServiceCategoriesGrid({
  categories,
  className = "",
}: ServiceCategoriesGridProps) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What We Can Help You With
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose from our wide range of professional home services. All our providers are verified and highly rated.
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          role="list"
          aria-label="Service categories"
        >
          {categories.map((category) => (
            <ServiceCategoryCard
              key={category.id}
              name={category.name}
              icon={category.icon}
              slug={category.slug}
              description={category.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
