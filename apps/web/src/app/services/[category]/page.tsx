import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/config/service-categories";
import { getSubServicesByCategory } from "@/config/sub-services";
import { Header, Footer } from "@/components/layout";
import { CategoryHero, ServiceCardsGrid } from "@/components/services";
import { servicesApi } from "@/lib/api";
import { transformServices } from "@/lib/transforms";
import { getCategoryIcon } from "@/lib/icons";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await servicesApi.getCategories();
    return categories.map((category) => ({
      category: category.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  try {
    const category = await servicesApi.getCategoryBySlug(categorySlug);
    return {
      title: `${category.name} Services | FixBari`,
      description:
        category.description || `Find ${category.name} services near you`,
    };
  } catch {
    return { title: "Category Not Found" };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  try {
    const [category, apiServices] = await Promise.all([
      servicesApi.getCategoryBySlug(categorySlug),
      servicesApi.getServicesByCategorySlug(categorySlug),
    ]);

    const services = transformServices(apiServices);
    const categoryIcon = getCategoryIcon(category.slug, category.icon);

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1">
          {/* Category Hero */}
          <CategoryHero
            name={category.name}
            slug={category.slug}
            icon={categoryIcon}
            description={category.description || undefined}
            serviceCount={services.length}
          />

          {/* Services Grid */}
          <section
            className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
            aria-labelledby="services-heading"
          >
            <div className="max-w-7xl mx-auto">
              <h2 id="services-heading" className="sr-only">
                {category.name} Services
              </h2>
              <ServiceCardsGrid
                services={services}
                categorySlug={categorySlug}
                categoryName={category.name}
              />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  } catch {
    const category = SERVICE_CATEGORIES.find((item) => item.slug === categorySlug);
    if (!category) notFound();
    const entries = getSubServicesByCategory(categorySlug);
    return <div className="min-h-screen bg-slate-50"><Header /><main className="mx-auto max-w-6xl px-5 py-12"><Link href="/services" className="text-teal-700">← All services</Link><h1 className="mt-6 text-4xl font-bold text-slate-900">{category.name}</h1><p className="mt-3 text-slate-600">{category.description}</p><p className="my-8 rounded-xl bg-cyan-50 p-4 text-sm text-teal-900">Original catalog preview — online booking requires our backend service.</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{entries.map((service) => <Link key={service.id} href={`/services/${categorySlug}/${service.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-400"><h2 className="text-xl font-semibold text-slate-900">{service.name}</h2><p className="mt-2 text-slate-600">{service.description}</p><p className="mt-4 font-medium text-teal-800">Reference: ৳{service.price.toLocaleString()}</p></Link>)}</div></main><Footer /></div>;
  }
}
