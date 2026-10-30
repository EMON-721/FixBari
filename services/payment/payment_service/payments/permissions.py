"""Service-to-service authorization for payment mutations.
Never ship PAYMENT_INTERNAL_TOKEN to browser code. Configure it in backend secrets.
"""
import hmac
from django.conf import settings
from rest_framework.permissions import BasePermission


class InternalServicePermission(BasePermission):
    message = "Payment mutation requires authenticated internal service"

    def has_permission(self, request, view):
        configured = getattr(settings, "PAYMENT_INTERNAL_TOKEN", "")
        supplied = request.headers.get("X-Internal-Service-Token", "")
        return bool(configured and supplied and hmac.compare_digest(configured, supplied))
