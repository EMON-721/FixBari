import type { Options, ConsumeMessage } from "amqplib";
import type { BaseEvent } from "@local-services/types";

export interface RabbitMQConfig {
  url: string;
  prefetch?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface PublisherOptions {
  exchange: string;
  routingKey: string;
  persistent?: boolean;
}

export interface ConsumerOptions {
  queue: string;
  exchange: string;
  routingKey: string;
  prefetch?: number;
  noAck?: boolean;
}

export type MessageHandler<T extends BaseEvent = BaseEvent> = (
  message: T,
  raw: ConsumeMessage
) => Promise<void>;

export interface ExchangeConfig {
  name: string;
  type: "topic" | "direct" | "fanout";
  options?: Options.AssertExchange;
}

export interface QueueConfig {
  name: string;
  options?: Options.AssertQueue;
  bindings: Array<{
    exchange: string;
    routingKey: string;
  }>;
}
