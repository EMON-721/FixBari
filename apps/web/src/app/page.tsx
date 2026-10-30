export const dynamic = "force-dynamic";

import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  ServiceCategoriesGrid,
  AboutSection,
  WhyUsSection,
  PartnersSection,
  CTASection,
} from "@/components/home";
import { servicesApi } from "@/lib/api";
import { transformCategories } from "@/lib/transforms";

export default async function Home() {
  // Fetch categories from the services API
  // Keep the public landing page available while the catalog API is offline.
  // Never synthesize live service availability or prices in this fallback.
  let categories: ReturnType<typeof transformCategories> = [];
  let catalogAvailable = true;
  try {
    const apiCategories = await servicesApi.getCategories();
    categories = transformCategories(apiCategories);
  } catch (error) {
    catalogAvailable = false;
    console.error("Catalog unavailable; serving landing page without live categories", error instanceof Error ? error.message : "Unknown catalog error");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Service Categories */}
        <section
          className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8"
          aria-labelledby="categories-heading"
        >
          <div className="max-w-7xl mx-auto">
            <h2 id="categories-heading" className="sr-only">
              Our Services
            </h2>
            {catalogAvailable ? (
              <ServiceCategoriesGrid categories={categories} />
            ) : (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-gray-800">
                <h3 className="text-lg font-semibold">Our service catalog is temporarily unavailable</h3>
                <p className="mt-2 text-sm">Please check back shortly. Booking and live pricing require our services to be online.</p>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Why Us Section */}
        <WhyUsSection />

        {/* Partners Section */}
        <PartnersSection />

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
