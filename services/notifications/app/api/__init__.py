from fastapi import APIRouter

from app.api.notifications import router as notifications_router

router = APIRouter()
router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
