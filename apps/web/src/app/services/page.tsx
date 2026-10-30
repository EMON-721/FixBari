export const dynamic = "force-dynamic";

import Link from "next/link";
import { Search, Star, Shield, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { servicesApi } from "@/lib/api";
import { transformCategories, transformServices } from "@/lib/transforms";
import { getCategoryIcon, getIcon } from "@/lib/icons";

export const metadata = {
  title: "All Services | FixBari",
  description: "Browse all professional home services. From cleaning to repairs, find verified professionals for every need.",
};

// Stats data
const stats = [
  { value: "10,000+", label: "Happy Customers", icon: Users },
  { value: "500+", label: "Verified Pros", icon: Shield },
  { value: "4.8", label: "Average Rating", icon: Star },
  { value: "30 min", label: "Avg Response", icon: Clock },
];

// Color schemes for categories
const categoryColors: Record<string, { bg: string; icon: string; gradient: string }> = {
  painting: { bg: "bg-orange-50", icon: "text-orange-500", gradient: "from-orange-500 to-amber-500" },
  cleaning: { bg: "bg-blue-50", icon: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
  electrical: { bg: "bg-yellow-50", icon: "text-yellow-600", gradient: "from-yellow-500 to-orange-500" },
  plumbing: { bg: "bg-cyan-50", icon: "text-cyan-500", gradient: "from-cyan-500 to-blue-500" },
  "home-repair": { bg: "bg-green-50", icon: "text-green-500", gradient: "from-green-500 to-emerald-500" },
  transport: { bg: "bg-purple-50", icon: "text-purple-500", gradient: "from-purple-500 to-pink-500" },
};

export default async function ServicesPage() {
  // Fetch all categories with their services
  const apiCategories = await servicesApi.getCategories({ includeServices: true });
  const totalServices = apiCategories.reduce(
    (acc, cat) => acc + (cat._count?.services || cat.services?.length || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{totalServices}+ Services Available</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Find the Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                  Service for Your Home
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Browse our complete catalog of professional home services.
                Verified experts, transparent pricing, satisfaction guaranteed.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto">
                <Link
                  href="/search"
                  className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow group"
                >
                  <Search className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="text-gray-500 flex-1 text-left">Search for any service...</span>
                  <span className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg">
                    Search
                  </span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-12">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                Browse by Category
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                All Service Categories
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Select a category to explore all available services and find the perfect solution for your needs.
              </p>
            </div>

            {/* Categories with Services */}
            <div className="space-y-12 sm:space-y-16">
              {apiCategories.map((category) => {
                const Icon = getCategoryIcon(category.slug, category.icon);
                const services = category.services || [];
                const colors = categoryColors[category.slug] || { bg: "bg-primary/10", icon: "text-primary", gradient: "from-primary to-amber-500" };

                return (
                  <div key={category.id} className="relative">
                    {/* Category Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center`}>
                          <Icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-gray-500">{services.length} services available</p>
                        </div>
                      </div>
                      <Link
                        href={`/services/${category.slug}`}
                        className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                      >
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {services.map((service) => {
                        const ServiceIcon = getIcon(service.icon);
                        const price = typeof service.basePrice === "string"
                          ? parseFloat(service.basePrice)
                          : service.basePrice;
                        return (
                          <Link
                            key={service.id}
                            href={`/services/${category.slug}/${service.slug}`}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Service Icon */}
                            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                              <ServiceIcon className={`w-6 h-6 ${colors.icon}`} strokeWidth={1.5} />
                            </div>

                            {/* Service Info */}
                            <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                              {service.description}
                            </p>

                            {/* Price & Rating */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div>
                                <span className="text-lg font-bold text-gray-900">
                                  {price.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500"> tk</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  4.5
                                </span>
                              </div>
                            </div>

                            {/* Hover Arrow */}
                            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our Services?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every service provider on our platform goes through a rigorous verification process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Verified Professionals",
                  description: "All service providers are background checked and verified",
                  icon: Shield,
                  color: "bg-green-50 text-green-600",
                },
                {
                  title: "Transparent Pricing",
                  description: "No hidden fees. Know the cost before you book",
                  icon: CheckCircle2,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Satisfaction Guaranteed",
                  description: "Not happy? We'll make it right or refund you",
                  icon: Star,
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  title: "24/7 Support",
                  description: "Our support team is always ready to help",
                  icon: Clock,
                  color: "bg-purple-50 text-purple-600",
                },
              ].map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <FeatureIcon className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-amber-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Can&apos;t Find What You&apos;re Looking For?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Contact us and we&apos;ll help you find the perfect service provider for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+8801700000000"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us Now
              </a>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all"
              >
                <Search className="w-5 h-5" />
                Search Services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
