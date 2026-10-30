import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  RabbitMQClient,
  Exchanges,
  RoutingKeys,
} from "@local-services/rabbitmq-client";
import type {
  ServiceCreatedPayload,
  ServiceUpdatedPayload,
  ServiceDeletedPayload,
  CategoryCreatedPayload,
  CategoryUpdatedPayload,
  CategoryDeletedPayload,
} from "@local-services/types";
import { randomUUID } from "crypto";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private client: RabbitMQClient | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>("RABBITMQ_URL");
    if (url) {
      try {
        this.client = new RabbitMQClient({ url });
        await this.client.connect();
        console.log("RabbitMQ connected successfully");
      } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
      }
    }
  }

  async onModuleDestroy() {
    await this.client?.close();
  }

  private async publish<T>(routingKey: string, payload: T) {
    if (!this.client?.isConnected()) {
      console.warn("RabbitMQ not connected, skipping event publish");
      return;
    }

    try {
      await this.client.publish(
        {
          eventType: routingKey,
          timestamp: new Date().toISOString(),
          correlationId: randomUUID(),
          payload,
        },
        {
          exchange: Exchanges.EVENTS,
          routingKey,
        }
      );
      console.log(`Event published: ${routingKey}`);
    } catch (error) {
      console.error(`Failed to publish event ${routingKey}:`, error);
    }
  }

  // Service event publishers
  async publishServiceCreated(payload: ServiceCreatedPayload) {
    await this.publish(RoutingKeys.SERVICE_CREATED, payload);
  }

  async publishServiceUpdated(payload: ServiceUpdatedPayload) {
    await this.publish(RoutingKeys.SERVICE_UPDATED, payload);
  }

  async publishServiceDeleted(payload: ServiceDeletedPayload) {
    await this.publish(RoutingKeys.SERVICE_DELETED, payload);
  }

  // Category event publishers
  async publishCategoryCreated(payload: CategoryCreatedPayload) {
    await this.publish(RoutingKeys.CATEGORY_CREATED, payload);
  }

  async publishCategoryUpdated(payload: CategoryUpdatedPayload) {
    await this.publish(RoutingKeys.CATEGORY_UPDATED, payload);
  }

  async publishCategoryDeleted(payload: CategoryDeletedPayload) {
    await this.publish(RoutingKeys.CATEGORY_DELETED, payload);
  }
}
