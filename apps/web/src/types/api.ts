// API Response Types for Services Microservice

export interface ApiFeature {
  id: string;
  categoryId: string;
  text: string;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStep {
  id: string;
  categoryId: string;
  stepNumber: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  features: ApiFeature[];
  steps: ApiStep[];
  services?: ApiService[];
  _count?: {
    services: number;
  };
}

export interface ApiService {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  basePrice: string | number; // Decimal from Prisma comes as string
  duration: number; // Minutes
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: ApiCategory;
}

export interface SearchResult {
  categories: ApiCategory[];
  services: ApiService[];
}
