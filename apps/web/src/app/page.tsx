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
  const apiCategories = await servicesApi.getCategories();
  const categories = transformCategories(apiCategories);

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
            <ServiceCategoriesGrid categories={categories} />
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
