import { Calendar, Search, UserCheck, Sparkles, type LucideIcon } from "lucide-react";
import type { HowItWorksStep } from "@/types/category-feature";

// Step icons mapping
const stepIcons: LucideIcon[] = [Search, Calendar, UserCheck, Sparkles];

// Step colors
const stepColors = [
  { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" },
  { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600" },
  { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600" },
  { bg: "bg-green-500", light: "bg-green-50", text: "text-green-600" },
];

const defaultColor = { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" };

function getStepIcon(index: number): LucideIcon {
  return stepIcons[index % stepIcons.length] ?? Search;
}

function getStepColor(index: number) {
  return stepColors[index % stepColors.length] ?? defaultColor;
}

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
}

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Easy Process
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Book your service in just a few simple steps
          </p>
        </div>

        {/* Desktop: Cards layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const StepIcon = getStepIcon(index);
              const colors = getStepColor(index);
              return (
                <div key={step.step} className="relative group">
                  {/* Connector arrow */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 -right-3 w-6 h-6 text-gray-300 z-10">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}

                  {/* Card */}
                  <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
                    {/* Step number badge */}
                    <div className={`absolute -top-3 -left-3 w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 ${colors.light} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <StepIcon className={`w-8 h-8 ${colors.text}`} strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tablet: 2-column grid */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(index);
            const colors = getStepColor(index);
            return (
              <div key={step.step} className="relative group">
                <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  {/* Step number badge */}
                  <div className={`absolute -top-3 -left-3 w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {step.step}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <StepIcon className={`w-7 h-7 ${colors.text}`} strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="sm:hidden">
          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 to-green-500" />

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step, index) => {
                const StepIcon = getStepIcon(index);
                const colors = getStepColor(index);
                return (
                  <div key={step.step} className="relative flex gap-4">
                    {/* Step Circle */}
                    <div className={`w-12 h-12 rounded-full ${colors.bg} text-white flex items-center justify-center flex-shrink-0 shadow-lg z-10`}>
                      <StepIcon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    {/* Step Content */}
                    <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${colors.text}`}>Step {step.step}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Ready to get started?</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Book Your Service
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
