import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class NotificationChannel(PyEnum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class NotificationStatus(PyEnum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class NotificationLog(Base):
    __tablename__ = "notif_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    channel: Mapped[NotificationChannel] = mapped_column(Enum(NotificationChannel))
    template_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    status: Mapped[NotificationStatus] = mapped_column(
        Enum(NotificationStatus), default=NotificationStatus.PENDING
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class NotificationTemplate(Base):
    __tablename__ = "notif_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True)
    channel: Mapped[NotificationChannel] = mapped_column(Enum(NotificationChannel))
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class NotificationPreference(Base):
    __tablename__ = "notif_preferences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    email_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sms_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    push_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
