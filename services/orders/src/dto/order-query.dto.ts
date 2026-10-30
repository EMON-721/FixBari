import { OrderStatus } from "@local-services/database";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface AdminOrderQueryDto extends PaginationOptions {
  status?: OrderStatus;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "createdAt" | "scheduledDate" | "totalAmount";
  sortOrder?: "asc" | "desc";
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  technicianId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
}

export interface AssignTechnicianDto {
  technicianId: string;
}

export interface AdminOrderListItemDto {
  id: string;
  bookingId: string;
  // Flattened fields for list view
  serviceName: string;
  userName: string;
  technicianName: string | null;
  // Nested objects for detail view
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
  };
  service: {
    id: string;
    name: string;
  };
  technician: {
    id: string;
    name: string;
    phone: string | null;
    rating: number;
  } | null;
  status: string;
  tier: string;
  totalAmount: number;
  scheduledDate: string | null;
  scheduledTime: string | null;
  address: {
    area: string;
    city: string;
    division: string;
    postalCode: string;
  } | null;
  createdAt: string;
}

export interface AdminOrderDetailsDto extends AdminOrderListItemDto {
  baseAmount: number;
  tierMultiplier: number;
  areaSize: string | null;
  additionalInfo: string | null;
  notes: string | null;
  rating: number | null;
  review: string | null;
  completedDate: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  items: Array<{
    id: string;
    serviceId: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  history: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string;
    changedByRole: string;
    reason: string | null;
    createdAt: string;
  }>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
