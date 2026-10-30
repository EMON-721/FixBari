import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout";
import { SearchBar } from "@/components/home";
import { servicesApi } from "@/lib/api";
import { getCategoryIcon, getIcon } from "@/lib/icons";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;

  // If there's a query, use the search API; otherwise, fetch all categories
  let categories: Awaited<ReturnType<typeof servicesApi.getCategories>> = [];
  let services: Awaited<ReturnType<typeof servicesApi.search>>["services"] = [];

  let catalogAvailable = true;
  try {
    if (query && query.trim().length >= 2) {
      const results = await servicesApi.search(query);
      categories = results.categories;
      services = results.services;
    } else if (!query) {
      categories = await servicesApi.getCategories();
    }
  } catch {
    catalogAvailable = false;
  }

  const totalResults = categories.length + services.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="bg-teal-900 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Search Services
            </h1>
            <SearchBar placeholder="Search for a service..." />
          </div>
        </div>

        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {query && query.trim().length >= 2 && (
              <p className="text-gray-600 mb-6">
                {totalResults} result
                {totalResults !== 1 ? "s" : ""} for &quot;{query}
                &quot;
              </p>
            )}

            {query && query.trim().length === 1 && (
              <p className="text-gray-600 mb-6">
                Please enter at least 2 characters to search
              </p>
            )}

            {!catalogAvailable && <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-slate-800 mb-6"><h2 className="font-semibold">Search is temporarily unavailable</h2><p className="mt-2 text-sm">The live service catalog is offline. Try again after the backend connects.</p></div>}
            {/* Categories Results */}
            {categories.length > 0 && (
              <div className="mb-8">
                {query && services.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                )}
                <div className="space-y-4">
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.slug, category.icon);
                    return (
                      <Link
                        key={category.id}
                        href={`/services/${category.slug}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                        {category._count && (
                          <span className="text-sm text-gray-400">
                            {category._count.services} services
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services Results */}
            {services.length > 0 && (
              <div>
                {categories.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
                )}
                <div className="space-y-4">
                  {services.map((service) => {
                    const Icon = getIcon(service.icon);
                    const price = typeof service.basePrice === "string"
                      ? parseFloat(service.basePrice)
                      : service.basePrice;
                    return (
                      <Link
                        key={service.id}
                        href={`/services/${service.category?.slug || ""}/${service.slug}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {service.description}
                            </p>
                          )}
                          {service.category && (
                            <p className="text-xs text-primary mt-1">
                              in {service.category.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ৳{price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>4.5</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {catalogAvailable && query && query.trim().length >= 2 && totalResults === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No services found for &quot;{query}&quot;
                </p>
                <Link
                  href="/services"
                  className="text-primary hover:underline font-medium"
                >
                  View all services
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
