import {
  Palette,
  Layers,
  Sparkles,
  Shield,
  MessageSquare,
  SprayCan,
  Leaf,
  UserCheck,
  ThumbsUp,
  Zap,
  Settings,
  Clock,
  Wrench,
  Droplets,
  ShieldCheck,
  Hammer,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  Users,
} from "lucide-react";
import type { CategoryFeatureConfig } from "@/types/category-feature";

export const CATEGORY_FEATURES: CategoryFeatureConfig[] = [
  // PAINTING
  {
    categoryId: "painting",
    whatsIncluded: [
      { id: "paint-materials", text: "Premium quality paint materials", icon: Palette },
      { id: "paint-prep", text: "Surface preparation & priming", icon: Layers },
      { id: "paint-cleanup", text: "Post-work cleanup", icon: Sparkles },
      { id: "paint-warranty", text: "1-year service warranty", icon: Shield },
      { id: "paint-consult", text: "Free color consultation", icon: MessageSquare },
    ],
    howItWorks: [
      { step: 1, title: "Book Service", description: "Choose your service and schedule a convenient time" },
      { step: 2, title: "Get Quote", description: "Our expert visits and provides detailed estimation" },
      { step: 3, title: "Work Begins", description: "Professional painters complete the job" },
      { step: 4, title: "Final Review", description: "Inspect the work and confirm satisfaction" },
    ],
  },

  // CLEANING
  {
    categoryId: "cleaning",
    whatsIncluded: [
      { id: "clean-supplies", text: "All cleaning supplies included", icon: SprayCan },
      { id: "clean-equipment", text: "Professional-grade equipment", icon: Settings },
      { id: "clean-eco", text: "Eco-friendly products", icon: Leaf },
      { id: "clean-vetted", text: "Trained & vetted cleaners", icon: UserCheck },
      { id: "clean-guarantee", text: "Satisfaction guarantee", icon: ThumbsUp },
    ],
    howItWorks: [
      { step: 1, title: "Book Service", description: "Select cleaning type and schedule time" },
      { step: 2, title: "Team Arrives", description: "Our trained cleaners arrive on time" },
      { step: 3, title: "Deep Clean", description: "Thorough cleaning of your space" },
      { step: 4, title: "Quality Check", description: "Final walkthrough to ensure satisfaction" },
    ],
  },

  // ELECTRICAL
  {
    categoryId: "electrical",
    whatsIncluded: [
      { id: "elec-parts", text: "Quality electrical parts", icon: Zap },
      { id: "elec-certified", text: "Certified electricians", icon: UserCheck },
      { id: "elec-safety", text: "Safety inspection included", icon: ShieldCheck },
      { id: "elec-warranty", text: "Work warranty", icon: Shield },
      { id: "elec-fast", text: "Same-day service available", icon: Clock },
    ],
    howItWorks: [
      { step: 1, title: "Book Service", description: "Describe the electrical issue or requirement" },
      { step: 2, title: "Expert Assigned", description: "Certified electrician assigned to your job" },
      { step: 3, title: "Work Done", description: "Safe and professional installation/repair" },
      { step: 4, title: "Safety Test", description: "Complete testing and safety verification" },
    ],
  },

  // PLUMBING
  {
    categoryId: "plumbing",
    whatsIncluded: [
      { id: "plumb-parts", text: "Quality plumbing fixtures", icon: Droplets },
      { id: "plumb-expert", text: "Experienced plumbers", icon: UserCheck },
      { id: "plumb-leak", text: "Leak detection included", icon: ShieldCheck },
      { id: "plumb-warranty", text: "Service warranty", icon: Shield },
      { id: "plumb-emergency", text: "Emergency service available", icon: Clock },
    ],
    howItWorks: [
      { step: 1, title: "Book Service", description: "Describe the plumbing issue" },
      { step: 2, title: "Plumber Visits", description: "Expert diagnoses the problem" },
      { step: 3, title: "Repair Work", description: "Professional repair or installation" },
      { step: 4, title: "Leak Test", description: "Thorough testing to ensure no leaks" },
    ],
  },

  // HOME REPAIR
  {
    categoryId: "home-repair",
    whatsIncluded: [
      { id: "repair-tools", text: "Professional tools & equipment", icon: Wrench },
      { id: "repair-skilled", text: "Skilled repair technicians", icon: UserCheck },
      { id: "repair-materials", text: "Quality repair materials", icon: Hammer },
      { id: "repair-warranty", text: "Workmanship warranty", icon: Shield },
      { id: "repair-complete", text: "Complete job guarantee", icon: CheckCircle },
    ],
    howItWorks: [
      { step: 1, title: "Book Service", description: "Tell us what needs repair" },
      { step: 2, title: "Assessment", description: "Technician inspects and estimates" },
      { step: 3, title: "Repair Work", description: "Expert completes the repair" },
      { step: 4, title: "Final Check", description: "Quality inspection and approval" },
    ],
  },

  // TRANSPORT
  {
    categoryId: "transport",
    whatsIncluded: [
      { id: "trans-vehicle", text: "Well-maintained vehicles", icon: Truck },
      { id: "trans-packing", text: "Packing materials included", icon: Package },
      { id: "trans-tracking", text: "Real-time tracking", icon: MapPin },
      { id: "trans-insurance", text: "Transit insurance", icon: Shield },
      { id: "trans-team", text: "Trained moving team", icon: Users },
    ],
    howItWorks: [
      { step: 1, title: "Book Service", description: "Enter pickup and drop locations" },
      { step: 2, title: "Team Arrives", description: "Moving team arrives with vehicle" },
      { step: 3, title: "Safe Transit", description: "Careful loading and transport" },
      { step: 4, title: "Delivery", description: "Unloading and placement at destination" },
    ],
  },
];

export function getCategoryFeatures(categoryId: string): CategoryFeatureConfig | undefined {
  return CATEGORY_FEATURES.find((config) => config.categoryId === categoryId);
}
