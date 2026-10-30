import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubService } from "@/config/sub-services";
import { Header, Footer } from "@/components/layout";
import {
  ServiceDetailHero,
  WhatsIncludedSection,
  HowItWorksSection,
  ReviewsPlaceholderSection,
  RelatedServicesSection,
  StickyMobileBookingBar,
} from "@/components/services";
import { servicesApi } from "@/lib/api";
import {
  transformService,
  transformServices,
  transformFeatures,
  transformSteps,
  formatDuration,
} from "@/lib/transforms";
import { getIcon } from "@/lib/icons";

interface ServiceDetailPageProps {
  params: Promise<{ category: string; service: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await servicesApi.getCategories({ includeServices: true });
    const params: { category: string; service: string }[] = [];

    categories.forEach((category) => {
      category.services?.forEach((service) => {
        params.push({
          category: category.slug,
          service: service.slug,
        });
      });
    });

    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ServiceDetailPageProps) {
  const { category: categorySlug, service: serviceSlug } = await params;

  try {
    const apiService = await servicesApi.getServiceBySlug(categorySlug, serviceSlug);
    return {
      title: `${apiService.name} | FixBari`,
      description: apiService.description || `Book ${apiService.name} service`,
    };
  } catch {
    return { title: "Service Not Found" };
  }
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { category: categorySlug, service: serviceSlug } = await params;

  try {
    // Fetch service with category (includes features and steps)
    const [apiService, apiRelatedServices] = await Promise.all([
      servicesApi.getServiceBySlug(categorySlug, serviceSlug),
      servicesApi.getServicesByCategorySlug(categorySlug),
    ]);

    const service = transformService(apiService);
    const relatedServices = transformServices(apiRelatedServices);
    const serviceIcon = getIcon(apiService.icon);
    const price = typeof apiService.basePrice === "string"
      ? parseFloat(apiService.basePrice)
      : apiService.basePrice;

    // Get features and steps from the category that comes with the service
    const category = apiService.category;
    const features = category?.features ? transformFeatures(category.features) : [];
    const steps = category?.steps ? transformSteps(category.steps) : [];

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 pb-20 lg:pb-0">
          {/* Hero Section */}
          <ServiceDetailHero
            serviceName={service.name}
            serviceIcon={serviceIcon}
            serviceId={service.id}
            categoryName={category?.name || "Service"}
            categorySlug={categorySlug}
            rating={4.5}
            ratingCount={0}
            duration={formatDuration(apiService.duration)}
            price={price}
          />

          {/* About This Service */}
          {apiService.description && (
            <section className="py-16 sm:py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                      Overview
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      About This Service
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-8 sm:p-10 border border-gray-100">
                    <p className="text-gray-600 text-lg leading-relaxed text-center">
                      {apiService.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Licensed & Insured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Background Checked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Satisfaction Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* What's Included */}
          {features.length > 0 && (
            <WhatsIncludedSection
              features={features}
              serviceName={service.name}
            />
          )}

          {/* How It Works */}
          {steps.length > 0 && (
            <HowItWorksSection steps={steps} />
          )}

          {/* Customer Reviews */}
          <ReviewsPlaceholderSection
            rating={4.5}
            ratingCount={0}
          />

          {/* Related Services */}
          <RelatedServicesSection
            services={relatedServices}
            currentServiceId={service.id}
            categorySlug={categorySlug}
          />
        </main>

        <Footer />

        {/* Sticky Mobile Booking Bar */}
        <StickyMobileBookingBar
          price={price}
          serviceId={service.id}
          rating={4.5}
        />
      </div>
    );
  } catch {
    const item = getSubService(categorySlug, serviceSlug);
    if (!item) notFound();
    const Icon = item.icon;
    return <div className="min-h-screen bg-slate-50"><Header/><main className="mx-auto max-w-4xl px-5 py-12"><Link href={`/services/${categorySlug}`} className="text-teal-800">← Back to category</Link><div className="mt-8 rounded-3xl bg-white p-8 shadow-sm"><Icon className="h-12 w-12 text-teal-800"/><h1 className="mt-5 text-3xl font-bold text-slate-950">{item.name}</h1><p className="mt-2 text-slate-500">{item.nameLocal}</p><p className="mt-6 text-lg text-slate-700">{item.description}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Reference price</p><p className="text-xl font-bold text-teal-800">৳{item.price.toLocaleString()}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Typical duration</p><p className="text-xl font-bold text-teal-800">{item.duration}</p></div></div><div role="status" className="mt-8 rounded-xl border border-cyan-200 bg-cyan-50 p-5 text-teal-900">Service information is available for browsing. Online bookings, live availability and payment are not yet connected; reference prices are not final quotes.</div><Link href="/services" className="mt-6 inline-block rounded-xl bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-700">Browse other services</Link></div></main><Footer/></div>;
  }
}
