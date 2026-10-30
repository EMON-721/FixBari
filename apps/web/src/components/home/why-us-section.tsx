import { WHY_US_FEATURES } from "@/config/why-us-features";
import { WhyUsFeatureCard } from "./why-us-feature-card";

interface WhyUsSectionProps {
  className?: string;
}

export function WhyUsSection({ className = "" }: WhyUsSectionProps) {
  return (
    <section
      aria-labelledby="why-us-heading"
      className={`bg-white py-16 sm:py-20 lg:py-24 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Why Choose Us
          </span>
          <h2
            id="why-us-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            The FixBari Advantage
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We&apos;re committed to providing you with the best service experience possible
          </p>
        </div>

        {/* Features Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          role="list"
          aria-label="Our features"
        >
          {WHY_US_FEATURES.map((feature, index) => (
            <WhyUsFeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
