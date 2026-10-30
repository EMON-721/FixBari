import Link from "next/link";
import Image from "next/image";
import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Handshake,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";

export const metadata = {
  title: "About Us | FixBari",
  description: "Learn about FixBari - Bangladesh's trusted platform for professional home services. Our mission, values, and the team behind the service.",
};

// Stats
const stats = [
  { value: "6", label: "Service Categories", icon: Users },
  { value: "24", label: "Seed Service Options", icon: Shield },
  { value: "3", label: "Application Portals", icon: CheckCircle2 },
  { value: "5", label: "Backend Services", icon: Star },
];

// Values
const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Technician verification and skills review are part of the planned operational workflow.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Sparkles,
    title: "Quality First",
    description: "We maintain the highest standards of service quality with regular training and audits.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Clock,
    title: "Reliability",
    description: "On-time service delivery with real-time tracking and transparent communication.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Heart,
    title: "Customer Care",
    description: "Support-ticket workflow is planned to handle customer questions and disputes.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Continuously improving our platform with cutting-edge technology.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Handshake,
    title: "Fair Pricing",
    description: "Transparent pricing with no hidden fees. You know exactly what you pay for.",
    color: "bg-cyan-50 text-cyan-600",
  },
];

// Team members
const team = [
  {
    name: "Md. Emon Hossain",
    role: "Owner & Project Lead",
    image: null,
    bio: "Project owner of FixBari — Bangladesh-focused home services platform.",
  },
  {
    name: "Operations",
    role: "Illustrative Operations Role",
    image: null,
    bio: "Role description only; team membership has not been verified.",
  },
  {
    name: "Technology",
    role: "Illustrative Technology Role",
    image: null,
    bio: "Illustrative role; assigned team member information will be confirmed by the owner.",
  },
  {
    name: "Customer Support",
    role: "Illustrative Customer Support Role",
    image: null,
    bio: "Illustrative role; assigned team member information will be confirmed by the owner.",
  },
];

// Timeline/milestones
// Illustrative roadmap milestones, not historical company claims.
const milestones = [
  { year: "Step 1", title: "Platform Foundation", description: "Three portals and service catalog" },
  { year: "Step 2", title: "Service Operations", description: "Booking, technician and payment workflows" },
  { year: "Step 3", title: "Broader Service Choice", description: "Category expansion and flexible quotations" },
  { year: "Step 4", title: "Verified Professionals", description: "Approval and quality review workflows" },
  { year: "Step 5", title: "Continued Improvement", description: "Accessibility and advanced service assistance" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
                <Globe className="w-4 h-4" />
                <span>Serving all across Bangladesh</span>
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transforming How
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                  Bangladesh Gets Things Done
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                We&apos;re on a mission to connect every home with trusted professionals,
                making quality services accessible to everyone.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                >
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  Join as Professional
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div>
                <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Built to Solve a Real Problem
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Finding reliable home service professionals in Bangladesh has always been a challenge.
                    From unreliable contractors to unpredictable pricing, homeowners faced constant frustration.
                  </p>
                  <p>
                    FixBari is being developed to make home services easier to find, book and manage.
                    Our goal is to support professional verification, transparent quotations and reliable job workflows.
                  </p>
                  <p>
                    The platform is developed under the ownership of Md. Emon Hossain.
                    Operational availability and the number of verified professionals will be published only when verified.
                  </p>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Our Mission</h3>
                    <p className="text-sm text-gray-600">
                      To make quality home services accessible, affordable, and reliable for every household in Bangladesh.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                      <Eye className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Our Vision</h3>
                    <p className="text-sm text-gray-600">
                      To become South Asia&apos;s leading platform for home services, empowering millions of professionals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image/Visual */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">FixBari</h3>
                      <p className="text-gray-600">Quality service at your doorstep</p>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Top Rated</p>
                      <p className="text-xs text-gray-500">4.8/5 Stars</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">100% Verified</p>
                      <p className="text-xs text-gray-500">All Professionals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                Our Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Milestones We&apos;re Proud Of
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-8 lg:space-y-0">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative lg:flex items-center ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div className={`lg:w-1/2 ${index % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12"}`}>
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 inline-block">
                        <span className="text-primary font-bold text-lg">{milestone.year}</span>
                        <h3 className="font-semibold text-gray-900 mt-1">{milestone.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white shadow" />

                    {/* Empty space for alternating layout */}
                    <div className="hidden lg:block lg:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                What We Stand For
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do, from how we build our platform to how we serve our customers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-14 h-14 ${value.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                The People Behind
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Leadership
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A passionate team dedicated to transforming the home services industry.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border border-gray-100"
                >
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-r from-primary to-amber-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust FixBari for all their home service needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Book a Service
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
