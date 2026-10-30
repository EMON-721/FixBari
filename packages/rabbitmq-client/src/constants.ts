// Exchange names
export const Exchanges = {
  EVENTS: "local-services.events",
  DEAD_LETTER: "local-services.dead-letter",
} as const;

// Routing keys for events
export const RoutingKeys = {
  // User events
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  // Order events
  ORDER_PLACED: "order.placed",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_ASSIGNED: "order.assigned",
  ORDER_STATUS_CHANGED: "order.status_changed",
  ORDER_COMPLETED: "order.completed",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_TECHNICIAN_ASSIGNED: "order.technician_assigned",
  ORDER_JOB_STARTED: "order.job_started",
  ORDER_JOB_COMPLETED: "order.job_completed",
  ORDER_REVIEW_ADDED: "order.review_added",

  // Payment events
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SESSION_CREATED: "payment.session_created",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_CANCELLED: "payment.cancelled",
  PAYMENT_REFUNDED: "payment.refunded",

  // Notification triggers
  NOTIFICATION_SEND: "notification.send",
  NOTIFICATION_SENT: "notification.sent",
  NOTIFICATION_FAILED: "notification.failed",

  // Service events
  SERVICE_CREATED: "service.created",
  SERVICE_UPDATED: "service.updated",
  SERVICE_DELETED: "service.deleted",

  // Category events
  CATEGORY_CREATED: "category.created",
  CATEGORY_UPDATED: "category.updated",
  CATEGORY_DELETED: "category.deleted",
} as const;

// Queue names per service
export const Queues = {
  // Auth service queues
  AUTH_EVENTS: "auth.events",

  // Notifications service queues
  NOTIFICATIONS_USER_EVENTS: "notifications.user-events",
  NOTIFICATIONS_ORDER_EVENTS: "notifications.order-events",
  NOTIFICATIONS_PAYMENT_EVENTS: "notifications.payment-events",

  // Orders service queues
  ORDERS_PAYMENT_EVENTS: "orders.payment-events",
  ORDERS_SERVICE_EVENTS: "orders.service-events",
  ORDERS_JOB_EVENTS: "orders.job-events",

  // Payment service queues
  PAYMENT_ORDER_EVENTS: "payment.order-events",

  // Services service queues
  SERVICES_EVENTS: "services.events",
} as const;
