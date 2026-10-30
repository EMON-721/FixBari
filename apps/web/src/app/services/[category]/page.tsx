import { notFound } from "next/navigation";
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
    notFound();
  }
}
