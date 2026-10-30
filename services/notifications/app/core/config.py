from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://localservices:localservices@localhost:5432/localservices"

    # RabbitMQ
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"

    # Email settings (example)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "noreply@localservices.com"

    # SMS settings (example)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""

    model_config = SettingsConfigDict(
        env_file=[
            Path(__file__).resolve().parents[3] / ".env",  # Root .env
            ".env",  # Local .env
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
