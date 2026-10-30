from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter()


@router.post("/send", response_model=NotificationResponse)
async def send_notification(
    notification: NotificationCreate,
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    result = await service.send_notification(notification)
    return result


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    result = await service.get_notification(notification_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result


@router.get("/user/{user_id}")
async def get_user_notifications(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    return await service.get_user_notifications(user_id)
