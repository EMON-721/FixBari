export type PaymentMethod = "ONLINE" | "COD";
export type PaymentStatus = "PENDING" | "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface BookingFormData {
  serviceId: string;
  areaSize: string;
  tier: "standard" | "premium" | "deluxe";
  date: string;
  time: string;
  area: string;
  city: string;
  division: string;
  postalCode: string;
  additionalInfo?: string;
  paymentMethod: PaymentMethod;
  // Customer info for online payment
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface ServiceTier {
  id: "standard" | "premium" | "deluxe";
  name: string;
  multiplier: number;
}

export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

export interface BookingResult {
  bookingId: string;
  serviceName: string;
  tierName: string;
  date: string;
  time: string;
  address: string;
  totalPrice: number;
  status: BookingStatus;
}

export interface BookingErrorData {
  type: "validation" | "server" | "network" | "unknown";
  message: string;
  details?: string;
  serviceId?: string;
}

// API Response Types
export interface BookingAddress {
  area: string;
  city: string;
  division: string;
  postalCode: string;
}

export interface BookingItem {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingTechnician {
  id: string;
  name: string;
  avatar: string | null;
  phone: string;
  rating: number;
}

export interface BookingDetail {
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
  areaSize: string | null;
  additionalInfo: string | null;
  notes: string | null;
  rating: number | null;
  review: string | null;
  completedDate: string | null;
  assignedAt: string | null;
  startedAt: string | null;
}

export interface BookingListItem {
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

export interface BookingListResponse {
  data: BookingListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBookingResponse {
  bookingId: string;
  serviceName: string;
  tierName: string;
  date: string;
  time: string;
  address: string;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gatewayUrl?: string;
}

export interface AddReviewData {
  rating: number;
  review?: string;
}
