import json
from typing import Callable, Any

import aio_pika
from aio_pika import ExchangeType

from app.core.config import settings


class RabbitMQClient:
    def __init__(self):
        self.connection: aio_pika.RobustConnection | None = None
        self.channel: aio_pika.Channel | None = None
        self.exchange: aio_pika.Exchange | None = None

    async def connect(self):
        self.connection = await aio_pika.connect_robust(settings.rabbitmq_url)
        self.channel = await self.connection.channel()
        await self.channel.set_qos(prefetch_count=10)

        # Declare the main exchange
        self.exchange = await self.channel.declare_exchange(
            "local-services.events",
            ExchangeType.TOPIC,
            durable=True,
        )

    async def close(self):
        if self.connection:
            await self.connection.close()

    async def consume(
        self,
        queue_name: str,
        routing_key: str,
        callback: Callable[[dict[str, Any]], Any],
    ):
        if not self.channel or not self.exchange:
            raise RuntimeError("RabbitMQ not connected")

        queue = await self.channel.declare_queue(queue_name, durable=True)
        await queue.bind(self.exchange, routing_key)

        async def process_message(message: aio_pika.IncomingMessage):
            async with message.process():
                try:
                    body = json.loads(message.body.decode())
                    await callback(body)
                except Exception as e:
                    print(f"Error processing message: {e}")

        await queue.consume(process_message)

    async def publish(self, routing_key: str, message: dict[str, Any]):
        if not self.exchange:
            raise RuntimeError("RabbitMQ not connected")

        await self.exchange.publish(
            aio_pika.Message(
                body=json.dumps(message).encode(),
                content_type="application/json",
            ),
            routing_key=routing_key,
        )


rabbitmq_client = RabbitMQClient()
