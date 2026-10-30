import type { Address } from "./user";
import type { OrderStatus, OrderItem } from "./api";

export interface Order {
  id: string;
  userId: string;
  technicianId?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  address: Address;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}
