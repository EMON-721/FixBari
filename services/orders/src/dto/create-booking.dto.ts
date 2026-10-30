import { TierType } from "../utils/tier-pricing";

export type PaymentMethodType = "ONLINE" | "COD";

export interface CreateBookingDto {
  serviceId: string;
  areaSize: string;
  tier: TierType;
  date: string;
  time: string;
  area: string;
  city: string;
  division: string;
  postalCode: string;
  additionalInfo?: string;
  paymentMethod: PaymentMethodType;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentStatusType = "PENDING" | "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface BookingResponseDto {
  bookingId: string;
  serviceName: string;
  tierName: string;
  date: string;
  time: string;
  address: string;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatusType;
  gatewayUrl?: string;
}

export interface BookingListItemDto {
  id: string;
  bookingId: string;
  serviceName: string;
  tierName: string;
  date: string;
  time: string;
  address: string;
  totalPrice: number;
  status: BookingStatus;
  technician?: {
    name: string;
    phone: string | null;
    avatar: string | null;
    rating: number;
  } | null;
  createdAt: string;
}

export interface BookingDetailsDto extends BookingListItemDto {
  areaSize: string | null;
  additionalInfo: string | null;
  notes: string | null;
  rating: number | null;
  review: string | null;
  completedDate: string | null;
  assignedAt: string | null;
  startedAt: string | null;
}

export interface AddReviewDto {
  rating: number;
  review: string;
}

export interface CancelBookingDto {
  reason?: string;
}
