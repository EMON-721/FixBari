import json
import pika
from django.conf import settings


class RabbitMQPublisher:
    def __init__(self):
        self.connection = None
        self.channel = None

    def connect(self):
        if self.connection is None or self.connection.is_closed:
            parameters = pika.URLParameters(settings.RABBITMQ_URL)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()

            # Declare exchange
            self.channel.exchange_declare(
                exchange="local-services.events",
                exchange_type="topic",
                durable=True,
            )

    def publish(self, routing_key: str, message: dict):
        self.connect()

        self.channel.basic_publish(
            exchange="local-services.events",
            routing_key=routing_key,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,  # persistent
            ),
        )

    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()


rabbitmq_publisher = RabbitMQPublisher()
