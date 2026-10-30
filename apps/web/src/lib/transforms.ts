import type { LucideIcon } from "lucide-react";
import type {
  ApiCategory,
  ApiService,
  ApiFeature,
  ApiStep,
} from "@/types/api";
import type { ServiceCategory } from "@/types/service";
import type { SubService } from "@/types/sub-service";
import type {
  IncludedFeature,
  HowItWorksStep,
  CategoryFeatureConfig,
} from "@/types/category-feature";
import { getIcon, getCategoryIcon } from "./icons";

/**
 * Transform API category to frontend ServiceCategory
 */
export function transformCategory(api: ApiCategory): ServiceCategory {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    icon: getCategoryIcon(api.slug, api.icon),
    description: api.description || undefined,
  };
}

/**
 * Transform array of API categories
 */
export function transformCategories(apiCategories: ApiCategory[]): ServiceCategory[] {
  return apiCategories.map(transformCategory);
}

/**
 * Transform API service to frontend SubService
 */
export function transformService(api: ApiService): SubService {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    categoryId: api.category?.slug || api.categoryId,
    icon: getIcon(api.icon),
    price: typeof api.basePrice === "string" ? parseFloat(api.basePrice) : api.basePrice,
    rating: 4.5, // Default rating (not stored in DB yet)
    ratingCount: 0, // Default rating count
    description: api.description || undefined,
    duration: formatDuration(api.duration),
  };
}

/**
 * Transform array of API services
 */
export function transformServices(apiServices: ApiService[]): SubService[] {
  return apiServices.map(transformService);
}

/**
 * Transform API feature to frontend IncludedFeature
 */
export function transformFeature(feature: ApiFeature): IncludedFeature {
  return {
    id: feature.id,
    text: feature.text,
    icon: getIcon(feature.icon),
  };
}

/**
 * Transform array of API features
 */
export function transformFeatures(features: ApiFeature[]): IncludedFeature[] {
  return features.map(transformFeature);
}

/**
 * Transform API step to frontend HowItWorksStep
 */
export function transformStep(step: ApiStep): HowItWorksStep {
  return {
    step: step.stepNumber,
    title: step.title,
    description: step.description,
  };
}

/**
 * Transform array of API steps
 */
export function transformSteps(steps: ApiStep[]): HowItWorksStep[] {
  return steps.map(transformStep);
}

/**
 * Get category feature config from API category
 */
export function getCategoryFeatureConfig(category: ApiCategory): CategoryFeatureConfig {
  return {
    categoryId: category.slug,
    whatsIncluded: transformFeatures(category.features),
    howItWorks: transformSteps(category.steps),
  };
}

/**
 * Extended category type that includes features and steps
 */
export interface TransformedCategoryWithFeatures extends ServiceCategory {
  whatsIncluded: IncludedFeature[];
  howItWorks: HowItWorksStep[];
  serviceCount?: number;
}

/**
 * Transform API category with features and steps
 */
export function transformCategoryWithFeatures(
  api: ApiCategory
): TransformedCategoryWithFeatures {
  return {
    ...transformCategory(api),
    whatsIncluded: transformFeatures(api.features),
    howItWorks: transformSteps(api.steps),
    serviceCount: api._count?.services,
  };
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (minutes < 1440) {
    // Less than a day
    if (remainingMins === 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    return `${hours}-${hours + 1} hours`;
  }

  const days = Math.floor(minutes / 1440);
  if (days === 1) {
    return "1 day";
  }
  return `${days} days`;
}

/**
 * Format price in Taka
 */
export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-BD")}`;
}
