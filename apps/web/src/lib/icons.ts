import {
  Wrench,
  Sparkles,
  Zap,
  Paintbrush,
  Droplets,
  Truck,
  UserCheck,
  Hammer,
  Shield,
  CheckCircle,
  SprayCan,
  Settings,
  Leaf,
  ThumbsUp,
  ShieldCheck,
  Clock,
  Palette,
  Layers,
  MessageSquare,
  Package,
  MapPin,
  Users,
  DoorOpen,
  LayoutGrid,
  Home,
  CookingPot,
  Bath,
  Fan,
  Lightbulb,
  Snowflake,
  PaintBucket,
  Pipette,
  Waves,
  Flame,
  Building2,
  Sofa,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

// Map of icon name strings to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Sparkles,
  Zap,
  Paintbrush,
  Droplets,
  Truck,
  UserCheck,
  Hammer,
  Shield,
  CheckCircle,
  SprayCan,
  Settings,
  Leaf,
  ThumbsUp,
  ShieldCheck,
  Clock,
  Palette,
  Layers,
  MessageSquare,
  Package,
  MapPin,
  Users,
  DoorOpen,
  LayoutGrid,
  Home,
  CookingPot,
  Bath,
  Fan,
  Lightbulb,
  Snowflake,
  PaintBucket,
  Pipette,
  Waves,
  Flame,
  Building2,
  Sofa,
  HelpCircle,
};

/**
 * Get a Lucide icon component by name
 * Returns HelpCircle as fallback if icon not found
 */
export function getIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return HelpCircle;
  return iconMap[iconName] || HelpCircle;
}

// Pre-defined category icons (fallback by slug)
export const categoryIconsBySlug: Record<string, LucideIcon> = {
  "home-repair": Wrench,
  cleaning: Sparkles,
  electrical: Zap,
  painting: Paintbrush,
  plumbing: Droplets,
  transport: Truck,
};

/**
 * Get category icon by slug or icon name
 */
export function getCategoryIcon(
  slug: string,
  iconName?: string | null
): LucideIcon {
  if (iconName) {
    const icon = iconMap[iconName];
    if (icon) return icon;
  }
  return categoryIconsBySlug[slug] || HelpCircle;
}

export { type LucideIcon };
