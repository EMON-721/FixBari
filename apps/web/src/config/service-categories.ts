import { Wrench, Sparkles, Zap, Paintbrush, Droplets, Truck, Snowflake, Bug, Hammer, Trees } from "lucide-react";
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
  { id:"appliance-ac",name:"Appliance & AC",nameLocal:"অ্যাপ্লায়েন্স ও এসি",slug:"appliance-ac",icon:Snowflake,description:"Appliance diagnostics, maintenance and repairs" },
  { id:"pest-control",name:"Pest Control",nameLocal:"পেস্ট কন্ট্রোল",slug:"pest-control",icon:Bug,description:"Home and building pest treatment services" },
  { id:"home-improvement",name:"Home Improvement",nameLocal:"হোম ইমপ্রুভমেন্ট",slug:"home-improvement",icon:Hammer,description:"Renovation and structural maintenance" },
  { id:"outdoor-maintenance",name:"Outdoor & Maintenance",nameLocal:"আউটডোর ও মেইনটেন্যান্স",slug:"outdoor-maintenance",icon:Trees,description:"Garden, water tank and property systems care" },
];
