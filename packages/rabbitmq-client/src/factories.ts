import { RabbitMQClient } from "./client";
import type {
  RabbitMQConfig,
  PublisherOptions,
  ConsumerOptions,
  MessageHandler,
} from "./types";
import type { BaseEvent } from "@local-services/types";
import { Exchanges } from "./constants";

/**
 * Create a publisher function for a specific event type
 */
export function createPublisher<T extends BaseEvent>(
  client: RabbitMQClient,
  routingKey: string
) {
  const options: PublisherOptions = {
    exchange: Exchanges.EVENTS,
    routingKey,
    persistent: true,
  };

  return async (event: Omit<T, "timestamp" | "correlationId">) => {
    const fullEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
    } as T;

    return client.publish(fullEvent, options);
  };
}

/**
 * Create a consumer for a specific queue and routing pattern
 */
export function createConsumer<T extends BaseEvent>(
  client: RabbitMQClient,
  queueName: string,
  routingPattern: string,
  handler: MessageHandler<T>,
  options?: Partial<ConsumerOptions>
) {
  const consumerOptions: ConsumerOptions = {
    queue: queueName,
    exchange: Exchanges.EVENTS,
    routingKey: routingPattern,
    prefetch: 10,
    noAck: false,
    ...options,
  };

  return client.consume(consumerOptions, handler);
}

/**
 * Initialize RabbitMQ client with connection
 */
export async function initializeRabbitMQ(
  config: RabbitMQConfig
): Promise<RabbitMQClient> {
  const client = new RabbitMQClient(config);
  await client.connect();
  return client;
}
