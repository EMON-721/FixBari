import amqp, { type ChannelModel, type Channel, type ConsumeMessage } from "amqplib";
import type {
  RabbitMQConfig,
  PublisherOptions,
  ConsumerOptions,
  MessageHandler,
} from "./types";
import type { BaseEvent } from "@local-services/types";
import { Exchanges } from "./constants";

export class RabbitMQClient {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private config: Required<RabbitMQConfig>;
  private reconnectAttempts = 0;
  private isConnecting = false;

  constructor(config: RabbitMQConfig) {
    this.config = {
      prefetch: 10,
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(this.config.prefetch);

      // Set up exchanges
      await this.channel.assertExchange(Exchanges.EVENTS, "topic", {
        durable: true,
      });
      await this.channel.assertExchange(Exchanges.DEAD_LETTER, "topic", {
        durable: true,
      });

      this.reconnectAttempts = 0;
      console.log("[RabbitMQ] Connected successfully");

      // Handle connection errors
      this.connection.on("error", (err) => {
        console.error("[RabbitMQ] Connection error:", err.message);
        this.handleReconnect();
      });

      this.connection.on("close", () => {
        console.warn("[RabbitMQ] Connection closed");
        this.handleReconnect();
      });
    } catch (error) {
      console.error("[RabbitMQ] Failed to connect:", error);
      this.handleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error("[RabbitMQ] Max reconnect attempts reached");
      throw new Error("Failed to connect to RabbitMQ after maximum attempts");
    }

    this.reconnectAttempts++;
    console.log(
      `[RabbitMQ] Reconnecting in ${this.config.reconnectDelay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => this.connect(), this.config.reconnectDelay);
  }

  async publish<T extends BaseEvent>(
    event: T,
    options: PublisherOptions
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const message = Buffer.from(JSON.stringify(event));

    return this.channel.publish(options.exchange, options.routingKey, message, {
      persistent: options.persistent ?? true,
      contentType: "application/json",
      timestamp: Date.now(),
      messageId: crypto.randomUUID(),
    });
  }

  async consume<T extends BaseEvent>(
    options: ConsumerOptions,
    handler: MessageHandler<T>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    // Assert queue with dead letter config
    await this.channel.assertQueue(options.queue, {
      durable: true,
      deadLetterExchange: Exchanges.DEAD_LETTER,
      deadLetterRoutingKey: `${options.queue}.dead`,
    });

    // Bind queue to exchange
    await this.channel.bindQueue(
      options.queue,
      options.exchange,
      options.routingKey
    );

    if (options.prefetch) {
      await this.channel.prefetch(options.prefetch);
    }

    console.log(`[RabbitMQ] Consuming from queue: ${options.queue}`);

    await this.channel.consume(
      options.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString()) as T;
          await handler(content, msg);

          if (!options.noAck) {
            this.channel?.ack(msg);
          }
        } catch (error) {
          console.error(`[RabbitMQ] Error processing message:`, error);

          if (!options.noAck) {
            // Reject and don't requeue (send to dead letter)
            this.channel?.nack(msg, false, false);
          }
        }
      },
      { noAck: options.noAck ?? false }
    );
  }

  async close(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log("[RabbitMQ] Connection closed gracefully");
    } catch (error) {
      console.error("[RabbitMQ] Error closing connection:", error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
