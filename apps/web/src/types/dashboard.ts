import type { BookingStatus } from "./booking";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface UserBooking {
  id: string;
  bookingId: string;
  serviceName: string;
  serviceIcon: string;
  categorySlug: string;
  tierName: string;
  date: string;
  time: string;
  address: string;
  totalPrice: number;
  status: BookingStatus;
  technicianName?: string;
  technicianPhone?: string;
  technicianAvatar?: string;
  createdAt: string;
}

export interface UserReview {
  id: string;
  bookingId: string;
  serviceName: string;
  technicianName: string;
  technicianAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  response?: {
    message: string;
    createdAt: string;
  };
}

export interface DashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalSpent: number;
  averageRating: number;
  reviewsGiven: number;
}

export interface NotificationPreferences {
  emailBookingUpdates: boolean;
  emailPromotions: boolean;
  smsBookingUpdates: boolean;
  smsReminders: boolean;
}

export interface UserSettings {
  notifications: NotificationPreferences;
  language: "en" | "bn";
  currency: "BDT" | "USD";
}
