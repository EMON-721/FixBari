import type { LucideIcon } from "lucide-react";

export interface ServiceCategory {
  id: string;
  name: string;
  nameLocal?: string;
  slug: string;
  icon: LucideIcon;
  description?: string;
}
