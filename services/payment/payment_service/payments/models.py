import uuid
from django.db import models


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


class PaymentMethod(models.TextChoices):
    CARD = "card", "Card"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    CASH = "cash", "Cash"
    SSLCOMMERZ = "sslcommerz", "SSLCOMMERZ"
    MOBILE_BANKING = "mobile_banking", "Mobile Banking"


class TransactionType(models.TextChoices):
    CHARGE = "charge", "Charge"
    REFUND = "refund", "Refund"
    PAYOUT = "payout", "Payout"


class TransactionStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SUCCESS = "success", "Success"
    FAILED = "failed", "Failed"


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_id = models.CharField(max_length=36, db_index=True)
    user_id = models.CharField(max_length=36, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.id} - {self.status}"


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE, related_name="transactions"
    )
    type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=TransactionStatus.choices,
        default=TransactionStatus.PENDING,
    )
    provider_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transactions"
        ordering = ["-created_at"]


class Refund(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE, related_name="refunds"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "refunds"
        ordering = ["-created_at"]


class SSLCommerzSession(models.Model):
    """Track SSLCOMMERZ payment sessions"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment, on_delete=models.CASCADE, related_name="sslcommerz_sessions"
    )
    session_key = models.CharField(max_length=255, unique=True)
    gateway_url = models.URLField(max_length=500)
    tran_id = models.CharField(max_length=100, unique=True, db_index=True)
    val_id = models.CharField(max_length=255, null=True, blank=True)
    bank_tran_id = models.CharField(max_length=255, null=True, blank=True)
    card_type = models.CharField(max_length=50, null=True, blank=True)
    card_brand = models.CharField(max_length=50, null=True, blank=True)
    store_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    status = models.CharField(max_length=50, default="pending")
    ipn_received = models.BooleanField(default=False)
    ipn_payload = models.JSONField(default=dict, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sslcommerz_sessions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"SSLCommerz Session {self.tran_id} - {self.status}"
