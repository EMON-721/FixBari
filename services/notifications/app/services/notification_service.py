"""Notification delivery with truthful delivery status.

Only EMAIL is supported when SMTP and a linked account are configured.
SMS/PUSH remain FAILED until real providers exist; never mark them SENT.
"""
import asyncio
import logging
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.notification import NotificationLog, NotificationStatus, NotificationChannel
from app.schemas.notification import NotificationCreate

logger = logging.getLogger(__name__)


def _smtp_send(recipient: str, subject: str, content: str) -> None:
    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = settings.email_from
    message['To'] = recipient
    message.set_content(content)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send_notification(self, notification: NotificationCreate) -> NotificationLog:
        log = NotificationLog(
            user_id=notification.user_id,
            channel=notification.channel,
            subject=notification.subject,
            content=notification.content,
            template_id=notification.template_id,
            status=NotificationStatus.PENDING,
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)

        try:
            if notification.channel != NotificationChannel.EMAIL:
                raise ValueError('SMS and push delivery are not yet configured')
            if not settings.smtp_user or not settings.smtp_password or not settings.email_from:
                raise ValueError('SMTP credentials or sender address not configured')
            # The user ID comes from the internal event. Never allow arbitrary client-supplied recipients.
            result = await self.db.execute(
                text('SELECT email FROM auth_users WHERE id = :id'),
                {'id': notification.user_id},
            )
            recipient = result.scalar_one_or_none()
            if not recipient:
                raise ValueError('No matching user email')
            await asyncio.to_thread(_smtp_send, recipient, notification.subject or 'FixBari', notification.content)
            log.status = NotificationStatus.SENT
            log.sent_at = datetime.utcnow()
            log.error_message = None
        except Exception as exc:
            log.status = NotificationStatus.FAILED
            # Never save SMTP error contents that could include credentials.
            log.error_message = exc.__class__.__name__ + ': delivery failed or provider not configured'
            logger.warning('Notification %s delivery failed (%s)', log.id, type(exc).__name__)

        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_notification(self, notification_id: str) -> NotificationLog | None:
        result = await self.db.execute(
            select(NotificationLog).where(NotificationLog.id == notification_id)
        )
        return result.scalar_one_or_none()

    async def get_user_notifications(self, user_id: str) -> list[NotificationLog]:
        result = await self.db.execute(
            select(NotificationLog)
            .where(NotificationLog.user_id == user_id)
            .order_by(NotificationLog.created_at.desc())
            .limit(50)
        )
        return list(result.scalars().all())
