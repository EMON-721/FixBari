import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { SERVICE_CATEGORIES } from "@/config/service-categories";
import { SUB_SERVICES } from "@/config/sub-services";
import { SearchBar } from "@/components/home/search-bar";

export const metadata = { title:"All Services | FixBari", description:"Explore home service categories and individual services in Bangladesh." };

export default function ServicesPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <main>
      <section className="bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">FixBari · Services</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">Everything your home needs, in one place.</h1>
          <p className="mt-5 max-w-2xl text-lg text-teal-100">Browse the original FixBari service catalog and additional planned services. Booking requires our live backend.</p>
          <div className="mt-8"><SearchBar placeholder="Search available home services" /></div>
        </div>
      </section>
      <nav aria-label="Service categories" className="sticky top-16 z-20 border-b border-teal-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2">
          {SERVICE_CATEGORIES.map(category=><a key={category.id} href={`#${category.slug}`} className="rounded-full border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-50">{category.name}</a>)}
        </div>
      </nav>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {SERVICE_CATEGORIES.map(category=>{
          const services=SUB_SERVICES.filter(service=>service.categoryId===category.slug);
          const Icon=category.icon;
          return <section id={category.slug} key={category.id} className="scroll-mt-40 pb-16">
            <div className="mb-6 flex items-center gap-4"><div className="rounded-2xl bg-teal-100 p-3 text-teal-800"><Icon className="h-7 w-7"/></div><div><h2 className="text-2xl font-bold sm:text-3xl">{category.name}</h2><p className="text-sm text-slate-500">{category.description}</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(service=><Link href={`/services/${category.slug}/${service.slug}`} key={service.id} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between"><service.icon className="h-7 w-7 text-teal-700"/><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">View details</span></div>
              <h3 className="text-lg font-bold group-hover:text-teal-800">{service.name}</h3><p className="mt-1 text-sm text-slate-500">{service.nameLocal}</p><p className="mt-3 text-sm text-slate-600">{service.description}</p><p className="mt-4 border-t border-slate-100 pt-3 text-sm font-semibold text-teal-900">{service.price > 0 ? `Illustrative price: ৳${service.price.toLocaleString()}` : "Planned · Price to be confirmed"}</p>
            </Link>)}</div>
          </section>;
        })}
      </div>
    </main><Footer />
  </div>;
}
