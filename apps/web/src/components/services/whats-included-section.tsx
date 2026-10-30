import { CheckCircle2 } from "lucide-react";
import type { IncludedFeature } from "@/types/category-feature";

// Color variants for visual interest
const colorVariants = [
  { bg: "bg-primary/10", icon: "text-primary" },
  { bg: "bg-blue-50", icon: "text-blue-600" },
  { bg: "bg-green-50", icon: "text-green-600" },
  { bg: "bg-purple-50", icon: "text-purple-600" },
  { bg: "bg-orange-50", icon: "text-orange-600" },
  { bg: "bg-cyan-50", icon: "text-cyan-600" },
];

const defaultColors = { bg: "bg-primary/10", icon: "text-primary" };

function getColors(index: number) {
  return colorVariants[index % colorVariants.length] ?? defaultColors;
}

interface WhatsIncludedSectionProps {
  features: IncludedFeature[];
  serviceName: string;
}

export function WhatsIncludedSection({
  features,
  serviceName,
}: WhatsIncludedSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Service Details
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              What&apos;s Included
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Everything you need for a complete {serviceName.toLowerCase()} experience
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>All items included in base price</span>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = getColors(index);
            return (
              <div
                key={feature.id}
                className="group relative flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center ${colors.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold mb-1">{feature.text}</p>
                  <p className="text-gray-500 text-sm">Professional quality guaranteed</p>
                </div>
                {/* Checkmark */}
                <div className="absolute top-4 right-4">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-10 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Need something specific?</p>
                <p className="text-gray-600 text-sm">Contact us for custom requirements</p>
              </div>
            </div>
            <a
              href="tel:+8801700000000"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
