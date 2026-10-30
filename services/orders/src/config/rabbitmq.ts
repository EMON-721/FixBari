import { RabbitMQClient, Exchanges, RoutingKeys } from "@local-services/rabbitmq-client";
import type {
  PaymentCompletedEvent,
  PaymentFailedEvent,
  PaymentCancelledEvent,
  PaymentCompletedPayload,
  PaymentFailedPayload,
  PaymentCancelledPayload,
} from "@local-services/types";
import { prisma } from "./database";

let rabbitmqClient: RabbitMQClient;

type PaymentEvent = PaymentCompletedEvent | PaymentFailedEvent | PaymentCancelledEvent;

export async function initializeRabbitMQ() {
  rabbitmqClient = new RabbitMQClient({
    url: process.env.RABBITMQ_URL || "amqp://admin:admin@localhost:5672",
  });

  await rabbitmqClient.connect();

  // Listen for payment events
  await rabbitmqClient.consume<PaymentEvent>(
    {
      queue: "orders.payment-events",
      exchange: Exchanges.EVENTS,
      routingKey: "payment.*",
    },
    async (event: PaymentEvent) => {
      console.log("Received payment event:", event.eventType);

      try {
        switch (event.eventType) {
          case "payment.completed":
            await handlePaymentCompleted(event.payload as PaymentCompletedPayload);
            break;

          case "payment.failed":
            await handlePaymentFailed(event.payload as PaymentFailedPayload);
            break;

          case "payment.cancelled":
            await handlePaymentCancelled(event.payload as PaymentCancelledPayload);
            break;

          default: {
            // Handle unknown event types (exhaustive check)
            const unknownEvent: never = event;
            console.log("Unknown payment event type:", (unknownEvent as PaymentEvent).eventType);
          }
        }
      } catch (error) {
        console.error("Error handling payment event:", error);
      }
    }
  );
}

async function handlePaymentCompleted(payload: PaymentCompletedPayload) {
  const { orderId, bookingId } = payload;

  console.log(`Processing payment.completed for order ${orderId} (${bookingId})`);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "COMPLETED",
        paidAt: new Date(),
      },
    }),
    prisma.orderHistory.create({
      data: {
        orderId,
        fromStatus: "PENDING",
        toStatus: "CONFIRMED",
        changedBy: "SYSTEM",
        changedByRole: "SYSTEM",
        reason: `Payment completed via ${payload.method || "SSLCOMMERZ"}`,
      },
    }),
  ]);

  console.log(`Order ${orderId} confirmed after payment completed`);
}

async function handlePaymentFailed(payload: PaymentFailedPayload) {
  const { orderId, bookingId, reason } = payload;

  console.log(`Processing payment.failed for order ${orderId} (${bookingId}): ${reason}`);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "FAILED",
    },
  });

  console.log(`Order ${orderId} payment failed: ${reason}`);
}

async function handlePaymentCancelled(payload: PaymentCancelledPayload) {
  const { orderId, bookingId } = payload;

  console.log(`Processing payment.cancelled for order ${orderId} (${bookingId})`);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "FAILED",
    },
  });

  console.log(`Order ${orderId} payment cancelled`);
}

export async function publishOrderPlaced(orderId: string, userId: string, totalAmount: number) {
  if (!rabbitmqClient) {
    console.error("RabbitMQ not initialized");
    return;
  }

  await rabbitmqClient.publish(
    {
      eventType: "order.placed",
      timestamp: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
      payload: {
        orderId,
        userId,
        totalAmount,
        items: [],
      },
    },
    {
      exchange: Exchanges.EVENTS,
      routingKey: RoutingKeys.ORDER_PLACED,
    }
  );
}

export { rabbitmqClient };
