import { Target, Heart, Zap } from "lucide-react";

interface AboutSectionProps {
  className?: string;
}

export function AboutSection({ className = "" }: AboutSectionProps) {
  return (
    <section
      aria-labelledby="about-heading"
      className={`bg-gray-50 py-16 sm:py-20 lg:py-24 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              About Us
            </span>
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
            >
              Your Trusted Partner for
              <span className="text-primary"> Home Services</span>
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              FixBari is Bangladesh&apos;s trusted platform connecting you with
              verified, skilled professionals for all your home service needs. From
              plumbing and electrical work to cleaning and transportation, we make it
              easy to find the right help when you need it.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Our mission is to simplify your life by providing reliable, affordable,
              and high-quality services at your doorstep.
            </p>

            {/* Values */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Our Mission</h4>
                  <p className="text-sm text-gray-500">Quality service for all</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Our Values</h4>
                  <p className="text-sm text-gray-500">Trust & reliability</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Our Promise</h4>
                  <p className="text-sm text-gray-500">Fast & efficient</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Stats Card */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-4 rounded-2xl bg-gray-50">
                  <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">10K+</p>
                  <p className="text-gray-600 font-medium">Happy Customers</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gray-50">
                  <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">500+</p>
                  <p className="text-gray-600 font-medium">Expert Pros</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gray-50">
                  <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">6</p>
                  <p className="text-gray-600 font-medium">Service Types</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gray-50">
                  <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">4.9</p>
                  <p className="text-gray-600 font-medium">Avg. Rating</p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-100 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
