import { PARTNERS } from "@/config/partners";
import { PartnerLogo } from "./partner-logo";

interface PartnersSectionProps {
  className?: string;
}

export function PartnersSection({ className = "" }: PartnersSectionProps) {
  return (
    <section
      aria-labelledby="partners-heading"
      className={`bg-gray-50 py-16 sm:py-20 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Partners
          </span>
          <h2
            id="partners-heading"
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
          >
            Trusted by Leading Brands
          </h2>
          <p className="text-gray-600 text-lg">
            Working together to deliver excellence
          </p>
        </div>

        {/* Partner Logos */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
          role="list"
          aria-label="Partner logos"
        >
          {PARTNERS.map((partner, index) => (
            <PartnerLogo key={partner.id} name={partner.name} index={index} />
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            Join our network of trusted service providers and grow your business
          </p>
        </div>
      </div>
    </section>
  );
}
