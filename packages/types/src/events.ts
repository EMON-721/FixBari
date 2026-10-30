// Base event interface
export interface BaseEvent<T = unknown> {
  eventType: string;
  timestamp: string;
  correlationId: string;
  payload: T;
}

// User events
export interface UserCreatedPayload {
  userId: string;
  email: string;
  role: "customer" | "technician" | "admin";
  firstName?: string;
  lastName?: string;
}

export interface UserCreatedEvent extends BaseEvent<UserCreatedPayload> {
  eventType: "user.created";
}

// Order events
export interface OrderPlacedPayload {
  orderId: string;
  userId: string;
  items: Array<{
    serviceId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

export interface OrderPlacedEvent extends BaseEvent<OrderPlacedPayload> {
  eventType: "order.placed";
}

export interface OrderStatusChangedPayload {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  updatedBy?: string;
}

export interface OrderStatusChangedEvent
  extends BaseEvent<OrderStatusChangedPayload> {
  eventType: "order.status_changed";
}

// Payment events
export interface PaymentSessionCreatedPayload {
  orderId: string;
  bookingId: string;
  paymentId: string;
  sessionId: string;
  gatewayUrl: string;
  tranId: string;
  expiresAt: string;
}

export interface PaymentSessionCreatedEvent
  extends BaseEvent<PaymentSessionCreatedPayload> {
  eventType: "payment.session_created";
}

export interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  bookingId?: string;
  userId: string;
  amount: number;
  storeAmount?: number;
  currency: string;
  method: "card" | "bank_transfer" | "cash" | "sslcommerz" | "mobile_banking" | string;
  tranId?: string;
  valId?: string;
  bankTranId?: string;
  cardType?: string;
  cardBrand?: string;
}

export interface PaymentCompletedEvent
  extends BaseEvent<PaymentCompletedPayload> {
  eventType: "payment.completed";
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  bookingId?: string;
  userId: string;
  reason: string;
  tranId?: string;
  failedReason?: string;
}

export interface PaymentFailedEvent extends BaseEvent<PaymentFailedPayload> {
  eventType: "payment.failed";
}

export interface PaymentCancelledPayload {
  paymentId: string;
  orderId: string;
  bookingId?: string;
  userId: string;
  tranId?: string;
}

export interface PaymentCancelledEvent
  extends BaseEvent<PaymentCancelledPayload> {
  eventType: "payment.cancelled";
}

// Notification events
export interface NotificationSentPayload {
  notificationId: string;
  userId: string;
  channel: "email" | "sms" | "push";
  templateId: string;
}

export interface NotificationSentEvent
  extends BaseEvent<NotificationSentPayload> {
  eventType: "notification.sent";
}

// Service events
export interface ServiceCreatedPayload {
  serviceId: string;
  categoryId: string;
  name: string;
  slug: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
}

export interface ServiceCreatedEvent extends BaseEvent<ServiceCreatedPayload> {
  eventType: "service.created";
}

export interface ServiceUpdatedPayload {
  serviceId: string;
  categoryId: string;
  name: string;
  slug: string;
  basePrice: number;
  duration: number;
  isActive: boolean;
  changes: string[];
}

export interface ServiceUpdatedEvent extends BaseEvent<ServiceUpdatedPayload> {
  eventType: "service.updated";
}

export interface ServiceDeletedPayload {
  serviceId: string;
  categoryId: string;
  name: string;
}

export interface ServiceDeletedEvent extends BaseEvent<ServiceDeletedPayload> {
  eventType: "service.deleted";
}

// Category events
export interface CategoryCreatedPayload {
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface CategoryCreatedEvent
  extends BaseEvent<CategoryCreatedPayload> {
  eventType: "category.created";
}

export interface CategoryUpdatedPayload {
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  changes: string[];
}

export interface CategoryUpdatedEvent
  extends BaseEvent<CategoryUpdatedPayload> {
  eventType: "category.updated";
}

export interface CategoryDeletedPayload {
  categoryId: string;
  name: string;
}

export interface CategoryDeletedEvent
  extends BaseEvent<CategoryDeletedPayload> {
  eventType: "category.deleted";
}

// Booking/Job events
export interface TechnicianAssignedPayload {
  orderId: string;
  bookingId: string;
  technicianId: string;
  technicianName: string;
  customerId: string;
  serviceName: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
}

export interface TechnicianAssignedEvent
  extends BaseEvent<TechnicianAssignedPayload> {
  eventType: "order.technician_assigned";
}

export interface JobStartedPayload {
  orderId: string;
  bookingId: string;
  technicianId: string;
  technicianName: string;
  customerId: string;
  startedAt: string;
}

export interface JobStartedEvent extends BaseEvent<JobStartedPayload> {
  eventType: "order.job_started";
}

export interface JobCompletedPayload {
  orderId: string;
  bookingId: string;
  technicianId: string;
  technicianName: string;
  customerId: string;
  completedAt: string;
  totalAmount: number;
}

export interface JobCompletedEvent extends BaseEvent<JobCompletedPayload> {
  eventType: "order.job_completed";
}

export interface OrderCancelledPayload {
  orderId: string;
  bookingId: string;
  customerId: string;
  reason?: string;
  cancelledBy: string;
  cancelledByRole: string;
}

export interface OrderCancelledEvent extends BaseEvent<OrderCancelledPayload> {
  eventType: "order.cancelled";
}

export interface ReviewAddedPayload {
  orderId: string;
  bookingId: string;
  technicianId: string;
  customerId: string;
  rating: number;
  review: string;
}

export interface ReviewAddedEvent extends BaseEvent<ReviewAddedPayload> {
  eventType: "order.review_added";
}

// Union type of all events
export type DomainEvent =
  | UserCreatedEvent
  | OrderPlacedEvent
  | OrderStatusChangedEvent
  | PaymentSessionCreatedEvent
  | PaymentCompletedEvent
  | PaymentFailedEvent
  | PaymentCancelledEvent
  | NotificationSentEvent
  | ServiceCreatedEvent
  | ServiceUpdatedEvent
  | ServiceDeletedEvent
  | CategoryCreatedEvent
  | CategoryUpdatedEvent
  | CategoryDeletedEvent
  | TechnicianAssignedEvent
  | JobStartedEvent
  | JobCompletedEvent
  | OrderCancelledEvent
  | ReviewAddedEvent;

// Event type constants
export const EventTypes = {
  USER_CREATED: "user.created",
  ORDER_PLACED: "order.placed",
  ORDER_STATUS_CHANGED: "order.status_changed",
  ORDER_TECHNICIAN_ASSIGNED: "order.technician_assigned",
  ORDER_JOB_STARTED: "order.job_started",
  ORDER_JOB_COMPLETED: "order.job_completed",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_REVIEW_ADDED: "order.review_added",
  PAYMENT_SESSION_CREATED: "payment.session_created",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_CANCELLED: "payment.cancelled",
  NOTIFICATION_SENT: "notification.sent",
  SERVICE_CREATED: "service.created",
  SERVICE_UPDATED: "service.updated",
  SERVICE_DELETED: "service.deleted",
  CATEGORY_CREATED: "category.created",
  CATEGORY_UPDATED: "category.updated",
  CATEGORY_DELETED: "category.deleted",
} as const;
