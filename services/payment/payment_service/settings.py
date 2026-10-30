import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Fail closed in production; development-only fallback is never valid for deployment.
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "local-development-only-insecure-key"
    else:
        raise RuntimeError("DJANGO_SECRET_KEY must be configured in production")


# Parse ALLOWED_HOSTS from env, supporting Railway domains
_allowed_hosts = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
# Add Railway private networking domain if available
if os.getenv("RAILWAY_PRIVATE_DOMAIN"):
    _allowed_hosts.append(os.getenv("RAILWAY_PRIVATE_DOMAIN"))
# Add Railway public domain if available
if os.getenv("RAILWAY_PUBLIC_DOMAIN"):
    _allowed_hosts.append(os.getenv("RAILWAY_PUBLIC_DOMAIN"))
ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts if h.strip()]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "rest_framework",
    "payment_service.payments",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "payment_service.urls"

WSGI_APPLICATION = "payment_service.wsgi.application"

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://localservices:localservices@localhost:5432/localservices"
)
DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL)
}

# RabbitMQ
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin@localhost:5672/")

# SSLCOMMERZ Configuration
SSLCOMMERZ_STORE_ID = os.getenv("SSLCOMMERZ_STORE_ID", "")
SSLCOMMERZ_STORE_PASSWORD = os.getenv("SSLCOMMERZ_STORE_PASSWORD", "")
SSLCOMMERZ_ENVIRONMENT = os.getenv("SSLCOMMERZ_ENVIRONMENT", "sandbox")  # sandbox or live

# Service URLs
PAYMENT_BASE_URL = os.getenv("PAYMENT_BASE_URL", "http://localhost:8000")
WEB_APP_BASE_URL = os.getenv("WEB_APP_BASE_URL", "http://localhost:3001")

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "EXCEPTION_HANDLER": "payment_service.core.exception_handler.custom_exception_handler",
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Must be set on payment service and orders service, never exposed to clients.
PAYMENT_INTERNAL_TOKEN = os.getenv("PAYMENT_INTERNAL_TOKEN", "")
