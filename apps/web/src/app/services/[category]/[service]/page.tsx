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
    const isPriced = item.price > 0;
    const bookingUrl = `/book?service=${encodeURIComponent(item.id)}`;
    return (
      <div className="min-h-screen bg-slate-50">
        <Header/>
        <main>
          <section className="bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 px-5 py-12 text-white sm:py-20">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <Link href={`/services/${categorySlug}`} className="text-sm text-teal-100 hover:text-white">All services / {categorySlug.replace(/-/g," ")}</Link>
                <div className="mt-7 inline-flex rounded-2xl bg-white/10 p-5"><Icon className="h-12 w-12 text-cyan-200"/></div>
                <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{item.name}</h1>
                <p className="mt-2 text-xl text-teal-100">{item.nameLocal}</p>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200">{item.description}</p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-white/20 px-4 py-2">Estimated duration: {item.duration}</span>
                  <span className="rounded-full border border-white/20 px-4 py-2">Bangladesh home services</span>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="rounded-3xl bg-white p-7 text-slate-900 shadow-xl">
                  <p className="text-sm font-medium text-slate-500">{isPriced ? "Illustrative starting price" : "Quotation required"}</p>
                  <p className="mt-2 text-4xl font-bold text-teal-900">{isPriced ? `৳${item.price.toLocaleString()}` : "Price on request"}</p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">Select a package, schedule, location and payment preference. Final availability and charges are confirmed through the booking system.</p>
                  <Link href={bookingUrl} className="mt-7 flex w-full justify-center rounded-xl bg-teal-800 px-5 py-4 font-bold text-white hover:bg-teal-700">{isPriced ? "Continue to Booking" : "Request a Quotation"}</Link>
                  <p className="mt-3 text-center text-xs text-slate-500">No payment is collected on this details page.</p>
                </div>
              </div>
            </div>
          </section>
          <section className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="text-3xl font-bold text-slate-950">About this service</h2>
            <p className="mt-4 max-w-3xl text-lg text-slate-600">{item.description}</p>
            <h2 className="mt-14 text-3xl font-bold text-slate-950">How booking works</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-4">
              {[
                ["01","Choose service","Review service details and select a package"],
                ["02","Set schedule","Enter service address, date and time"],
                ["03","Review payment","Choose COD or online payment where available"],
                ["04","Track request","Receive a booking ID only when the backend accepts your request"]
              ].map(([number,title,description])=><div key={number} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="font-bold text-teal-700">{number}</span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm text-slate-600">{description}</p></div>)}
            </div>
            <div className="mt-10 flex gap-4"><Link href={bookingUrl} className="rounded-xl bg-teal-800 px-6 py-3 font-bold text-white">Continue</Link><Link href="/services" className="rounded-xl border border-teal-300 px-6 py-3 font-semibold text-teal-900">All services</Link></div>
          </section>
        </main>
        <Footer/>
      </div>
    );
  }
}
