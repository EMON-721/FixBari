import type { LucideIcon } from "lucide-react";

export interface IncludedFeature {
  id: string;
  text: string;
  icon: LucideIcon;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface CategoryFeatureConfig {
  categoryId: string;
  whatsIncluded: IncludedFeature[];
  howItWorks: HowItWorksStep[];
}
