from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import router
from app.core.config import settings
from app.core.rabbitmq import rabbitmq_client
from app.services.consumers import setup_consumers


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await rabbitmq_client.connect()
    await setup_consumers()
    print("Notifications service started")

    yield

    # Shutdown
    await rabbitmq_client.close()
    print("Notifications service stopped")


app = FastAPI(
    title="Notifications Service",
    description="Handles email, SMS, and push notifications",
    version="1.0.0",
    lifespan=lifespan,
    root_path="/api/notifications",
)

app.include_router(router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "notifications"}
