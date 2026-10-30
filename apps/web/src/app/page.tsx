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
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/config/service-categories";
import { SUB_SERVICES } from "@/config/sub-services";

export default async function Home() {
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
            <div className="mb-8 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Our services</p><h2 className="mt-2 text-3xl font-bold text-slate-950">Find the right help for your home</h2><p className="mt-3 text-slate-600">Browse 40 service listings across 10 categories. Booking and live availability require our backend.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {SERVICE_CATEGORIES.map(category => {
                const Icon = category.icon;
                const count = SUB_SERVICES.filter(service => service.categoryId === category.slug).length;
                return <Link key={category.slug} href={`/services#${category.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-md">
                  <div className="mb-4 inline-flex rounded-xl bg-teal-100 p-3 text-teal-800"><Icon className="h-7 w-7" /></div>
                  <h3 className="font-bold group-hover:text-teal-800">{category.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{count} services</p>
                </Link>;
              })}
            </div>
            <div className="mt-8 text-center"><Link href="/services" className="inline-flex rounded-xl bg-teal-800 px-7 py-3 font-semibold text-white hover:bg-teal-700">Explore all services</Link></div>
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
