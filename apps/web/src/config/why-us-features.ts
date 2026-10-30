import {
  ShieldCheck,
  BadgeCheck,
  Star,
  Zap,
  Headphones,
  MapPin,
  Wallet,
  Receipt,
  Clock,
} from "lucide-react";
import type { WhyUsFeature } from "@/types/home";

export const WHY_US_FEATURES: WhyUsFeature[] = [
  // Trust & Quality
  {
    id: "verified-professionals",
    title: "Verified Professionals",
    description: "All service providers are thoroughly vetted and background-checked",
    icon: ShieldCheck,
  },
  {
    id: "quality-guarantee",
    title: "Quality Guarantee",
    description: "100% satisfaction guaranteed or we'll make it right",
    icon: BadgeCheck,
  },
  {
    id: "rated-reviews",
    title: "Rated & Reviewed",
    description: "Transparent ratings from real customers",
    icon: Star,
  },
  // Convenience
  {
    id: "easy-booking",
    title: "Easy Booking",
    description: "Book services in just a few taps, anytime",
    icon: Zap,
  },
  {
    id: "24-7-support",
    title: "24/7 Support",
    description: "Round-the-clock customer support when you need it",
    icon: Headphones,
  },
  {
    id: "real-time-tracking",
    title: "Real-Time Tracking",
    description: "Track your service provider's arrival in real-time",
    icon: MapPin,
  },
  // Value
  {
    id: "competitive-pricing",
    title: "Competitive Pricing",
    description: "Best rates with no hidden fees",
    icon: Wallet,
  },
  {
    id: "transparent-costs",
    title: "Transparent Costs",
    description: "Upfront pricing before you book",
    icon: Receipt,
  },
  {
    id: "fast-response",
    title: "Fast Response",
    description: "Quick response times from available professionals",
    icon: Clock,
  },
];
