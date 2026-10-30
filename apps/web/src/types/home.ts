import type { LucideIcon } from "lucide-react";

export interface WhyUsFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin";
  href: string;
  ariaLabel: string;
}
