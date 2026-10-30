// Service Category types
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  servicesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Service types
export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  sortOrder: number;
  category?: ServiceCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  basePrice: number;
  duration: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateServiceDto {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  basePrice?: number;
  duration?: number;
  isActive?: boolean;
  sortOrder?: number;
}
