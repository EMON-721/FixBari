import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { BookingForm } from "@/components/booking";
import { servicesApi } from "@/lib/api";

interface BookPageProps {
  searchParams: Promise<{ service?: string }>;
}

export const metadata = {
  title: "Book a Service | FixBari",
  description: "Book your service appointment",
};

async function BookingContent({ searchParams }: BookPageProps) {
  const { service: serviceId } = await searchParams;

  // If no service ID provided
  if (!serviceId) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            No Service Selected
          </h1>
          <p className="text-gray-500 mb-6">
            Please select a service to book from our services page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 text-base font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  // Get service data from API
  let service;
  try {
    service = await servicesApi.getServiceById(serviceId, { includeCategory: true });
  } catch {
    // Service not found
  }

  // If service not found
  if (!service) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Service Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            The requested service could not be found. Please try selecting
            another service.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 text-base font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  // Extract only serializable data for the client component
  const price = typeof service.basePrice === "string"
    ? parseFloat(service.basePrice)
    : service.basePrice;

  const serviceData = {
    id: service.id,
    name: service.name,
    price,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Complete Your Booking
        </h1>
        <p className="text-gray-500">
          You&apos;re booking <span className="font-medium text-gray-700">{service.name}</span>
        </p>
      </div>

      {/* Booking Form */}
      <BookingForm service={serviceData} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-gray-500">Loading booking form...</p>
    </div>
  );
}

export default async function BookPage(props: BookPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <Suspense fallback={<LoadingState />}>
            <BookingContent searchParams={props.searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
