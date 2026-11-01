import Link from "next/link";
import { Wrench } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { SERVICE_CATEGORIES } from "@/config/service-categories";
import { SUB_SERVICES } from "@/config/sub-services";
import { SearchBar } from "@/components/home/search-bar";
import { servicesApi } from "@/lib/api";
import type { ApiCategory, ApiService } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "All Services | FixBari",
  description: "Explore home service categories and available FixBari services in Bangladesh.",
};

export default async function ServicesPage() {
  let liveCategories: ApiCategory[] = [];
  let liveServices: ApiService[] = [];
  try {
    [liveCategories, liveServices] = await Promise.all([
      servicesApi.getCategories(),
      servicesApi.getServices({ includeCategory: true }),
    ]);
  } catch {
    // Public catalog remains visible while the backend is offline.
    // Offline catalog items must NEVER be presented as bookable.
  }

  const categories = [
    ...SERVICE_CATEGORIES,
    ...liveCategories
      .filter(category => !SERVICE_CATEGORIES.some(item => item.slug === category.slug))
      .map(category => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        nameLocal: "",
        description: category.description || "",
        icon: Wrench,
      })),
  ];
  const categorySlugById = new Map(liveCategories.map(category => [category.id, category.slug]));
  const categoryIsActive = new Set(liveCategories.filter(category => category.isActive).map(category => category.slug));
  const serviceCategorySlug = (service: ApiService) =>
    service.category?.slug || categorySlugById.get(service.categoryId) || "";
  const serviceKey = (categorySlug: string, serviceSlug: string) => `${categorySlug}:${serviceSlug}`;
  const indexedLive = new Map(
    liveServices.map(service => [serviceKey(serviceCategorySlug(service), service.slug), service])
  );
  const staticKeys = new Set(SUB_SERVICES.map(service => serviceKey(service.categoryId, service.slug)));

  const allServices = [
    ...SUB_SERVICES.map(service => {
      const live = indexedLive.get(serviceKey(service.categoryId, service.slug));
      const bookable = Boolean(live?.isActive && Number(live.basePrice) > 0 && categoryIsActive.has(service.categoryId));
      return {
        id: service.id,
        name: live?.name || service.name,
        nameLocal: service.nameLocal || "",
        slug: service.slug,
        categoryId: service.categoryId,
        description: live?.description || service.description,
        icon: service.icon,
        price: live ? Number(live.basePrice) : service.price,
        bookable,
        sourcePriceApproved: bookable,
      };
    }),
    ...liveServices
      .filter(service => !staticKeys.has(serviceKey(serviceCategorySlug(service), service.slug)))
      .map(service => ({
        id: service.id,
        name: service.name,
        nameLocal: "",
        slug: service.slug,
        categoryId: serviceCategorySlug(service),
        description: service.description || "",
        icon: Wrench,
        price: Number(service.basePrice),
        bookable: Boolean(service.isActive && Number(service.basePrice) > 0 && categoryIsActive.has(serviceCategorySlug(service))),
        sourcePriceApproved: true,
      })),
  ];

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <main>
      <section className="bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">FixBari · Services</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">Everything your home needs, in one place.</h1>
          <p className="mt-5 max-w-2xl text-lg text-teal-100">Browse services, review availability and request a visit or quotation. Pay in cash when an approved job is completed.</p>
          <div className="mt-8"><SearchBar placeholder="Search available home services" /></div>
        </div>
      </section>
      <nav aria-label="Service categories" className="sticky top-16 z-20 border-b border-teal-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2">
          {categories.map(category => <a key={category.slug} href={`#${category.slug}`} className="rounded-full border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-50">{category.name}</a>)}
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {categories.map(category => {
          const services = allServices.filter(service => service.categoryId === category.slug);
          const Icon = category.icon;
          return <section id={category.slug} key={category.slug} className="scroll-mt-40 pb-16">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-800"><Icon className="h-7 w-7" /></div>
              <div><h2 className="text-2xl font-bold sm:text-3xl">{category.name}</h2><p className="text-sm text-slate-500">{category.description}</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(service => {
                const ItemIcon = service.icon;
                return <Link href={`/services/${category.slug}/${service.slug}`} key={service.id} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <ItemIcon className="h-7 w-7 text-teal-700" />
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${service.bookable ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>
                      {service.bookable ? "Booking available" : "Quote / approval required"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-teal-800">{service.name}</h3>
                  {service.nameLocal && <p className="mt-1 text-sm text-slate-500">{service.nameLocal}</p>}
                  <p className="mt-3 text-sm text-slate-600">{service.description}</p>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-sm font-semibold text-teal-900">
                    {service.bookable ? `Approved starting price: ৳${service.price.toLocaleString()}` : "Price / availability subject to admin confirmation"}
                  </p>
                </Link>;
              })}
            </div>
          </section>;
        })}
      </div>
    </main>
    <Footer />
  </div>;
}
