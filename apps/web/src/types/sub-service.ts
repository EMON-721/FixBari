import type { LucideIcon } from "lucide-react";

export interface SubService {
  id: string;
  name: string;
  nameLocal?: string;
  slug: string;
  categoryId: string;
  icon: LucideIcon;
  price: number;
  rating: number;
  ratingCount: number;
  description?: string;
  duration?: string;
}
