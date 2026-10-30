from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class NotificationCreate(BaseModel):
    user_id: str
    channel: NotificationChannel
    subject: str | None = None
    content: str
    template_id: str | None = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    channel: NotificationChannel
    subject: str | None
    content: str
    status: NotificationStatus
    created_at: datetime
    sent_at: datetime | None

    class Config:
        from_attributes = True
