from typing import Any

from app.core.rabbitmq import rabbitmq_client
from app.core.database import async_session_maker
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationCreate, NotificationChannel


async def handle_user_created(message: dict[str, Any]):
    """Handle user.created event - send welcome email"""
    print(f"Received user.created event: {message}")

    payload = message.get("payload", {})
    user_id = payload.get("userId")
    email = payload.get("email")

    if not user_id or not email:
        print("Invalid user.created payload")
        return

    async with async_session_maker() as db:
        service = NotificationService(db)
        await service.send_notification(
            NotificationCreate(
                user_id=user_id,
                channel=NotificationChannel.EMAIL,
                subject="Welcome to FixBari!",
                content=f"Hello! Welcome to FixBari. Your account has been created with email: {email}",
            )
        )


async def handle_order_placed(message: dict[str, Any]):
    """Handle order.placed event - send order confirmation"""
    print(f"Received order.placed event: {message}")

    payload = message.get("payload", {})
    user_id = payload.get("userId")
    order_id = payload.get("orderId")

    if not user_id or not order_id:
        print("Invalid order.placed payload")
        return

    async with async_session_maker() as db:
        service = NotificationService(db)
        await service.send_notification(
            NotificationCreate(
                user_id=user_id,
                channel=NotificationChannel.EMAIL,
                subject="Order Confirmation",
                content=f"Your order #{order_id} has been placed successfully!",
            )
        )


async def handle_payment_completed(message: dict[str, Any]):
    """Handle payment.completed event - send receipt"""
    print(f"Received payment.completed event: {message}")

    payload = message.get("payload", {})
    user_id = payload.get("userId")
    payment_id = payload.get("paymentId")
    amount = payload.get("amount")

    if not user_id:
        print("Invalid payment.completed payload")
        return

    async with async_session_maker() as db:
        service = NotificationService(db)
        await service.send_notification(
            NotificationCreate(
                user_id=user_id,
                channel=NotificationChannel.EMAIL,
                subject="Payment Receipt",
                content=f"Payment of ${amount} received. Payment ID: {payment_id}",
            )
        )


async def setup_consumers():
    """Set up all RabbitMQ consumers"""
    await rabbitmq_client.consume(
        "notifications.user-events",
        "user.*",
        handle_user_created,
    )

    await rabbitmq_client.consume(
        "notifications.order-events",
        "order.*",
        handle_order_placed,
    )

    await rabbitmq_client.consume(
        "notifications.payment-events",
        "payment.*",
        handle_payment_completed,
    )

    print("Notification consumers set up successfully")
