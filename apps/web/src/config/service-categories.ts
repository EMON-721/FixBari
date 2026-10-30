import { Wrench, Sparkles, Zap, Paintbrush, Droplets, Truck } from "lucide-react";
import type { ServiceCategory } from "@/types/service";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "home-repair",
    name: "Home Repair",
    nameLocal: "হোম রিপেয়ার",
    slug: "home-repair",
    icon: Wrench,
    description: "General home maintenance and repair services",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    nameLocal: "ক্লিনিং",
    slug: "cleaning",
    icon: Sparkles,
    description: "Professional cleaning services",
  },
  {
    id: "electrical",
    name: "Electrical",
    nameLocal: "ইলেকট্রিক্যাল",
    slug: "electrical",
    icon: Zap,
    description: "Licensed electricians for all electrical needs",
  },
  {
    id: "painting",
    name: "Painting",
    nameLocal: "পেইন্টিং",
    slug: "painting",
    icon: Paintbrush,
    description: "Interior and exterior painting services",
  },
  {
    id: "plumbing",
    name: "Plumbing",
    nameLocal: "প্লাম্বিং",
    slug: "plumbing",
    icon: Droplets,
    description: "Professional plumbing repairs and installation",
  },
  {
    id: "transport",
    name: "Transport",
    nameLocal: "ট্রান্সপোর্ট",
    slug: "transport",
    icon: Truck,
    description: "Moving and delivery services",
  },
];
