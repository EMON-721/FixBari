export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "customer" | "technician" | "admin";

export interface Technician extends User {
  role: "technician";
  specializations: string[];
  rating: number;
  completedJobs: number;
  isAvailable: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Customer extends User {
  role: "customer";
  addresses: Address[];
  preferredPaymentMethod?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}
