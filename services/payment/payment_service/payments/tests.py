"""Payment validation tests with a mocked SSLCOMMERZ provider. No real money is charged."""
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Payment, PaymentMethod, PaymentStatus, SSLCommerzSession


class FakeGateway:
    amount = "1500.00"
    result = "VALID"

    def validate_transaction(self, validation_id):
        return {"status": self.result, "tran_id": "FB-TEST-001", "currency": "BDT", "amount": self.amount}

    def verify_amount(self, expected, received):
        return abs(expected - received) < 0.01

    def query_transaction(self, tran_id):
        return {"status": self.result, "tran_id": tran_id}


@override_settings(ALLOWED_HOSTS=["testserver"], PAYMENT_INTERNAL_TOKEN="ci-only-internal-token")
class PaymentSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.payment = Payment.objects.create(
            order_id=str(uuid4()), user_id=str(uuid4()), amount=Decimal("1500.00"),
            currency="BDT", method=PaymentMethod.SSLCOMMERZ, status=PaymentStatus.PROCESSING)
        self.session = SSLCommerzSession.objects.create(
            payment=self.payment, session_key="session-test-001",
            gateway_url="https://example.com/test-payment",
            tran_id="FB-TEST-001", expires_at=timezone.now() + timedelta(minutes=20))
        self.gateway = FakeGateway()

    def test_internal_mutations_require_secret(self):
        response = self.client.post("/api/payment/", {
            "order_id": str(uuid4()), "user_id": str(uuid4()),
            "amount": "200.00", "method": "cash"
        }, format="json")
        self.assertEqual(response.status_code, 403)
        refund = self.client.post(f"/api/payment/{self.payment.pk}/refund", {
            "amount": "10.00", "reason": "Test"
        }, format="json")
        self.assertEqual(refund.status_code, 403)

    def test_wrong_amount_ipn_does_not_complete_payment(self):
        self.gateway.amount = "1490.00"
        with patch("payment_service.payments.views.get_sslcommerz_client", return_value=self.gateway):
            response = self.client.post("/api/payment/sslcommerz/ipn", {
                "tran_id": self.session.tran_id, "val_id": "verified-test", "status": "VALID"
            }, format="json")
        self.assertEqual(response.status_code, 400)
        self.payment.refresh_from_db()
        self.session.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)
        self.assertFalse(self.session.ipn_received)

    def test_validated_ipn_completes_payment(self):
        with patch("payment_service.payments.views.get_sslcommerz_client", return_value=self.gateway), \
                patch("payment_service.payments.views.rabbitmq_publisher.publish"):
            response = self.client.post("/api/payment/sslcommerz/ipn", {
                "tran_id": self.session.tran_id, "val_id": "verified-test", "status": "VALID"
            }, format="json")
        self.assertEqual(response.status_code, 200)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.COMPLETED)
        response = self.client.get(f"/api/payment/status?tran_id={self.session.tran_id}")
        self.assertEqual(response.json()["data"]["status"], PaymentStatus.COMPLETED)

    def test_forged_redirect_and_failure_ipn_do_not_mutate_status(self):
        response = self.client.post("/api/payment/sslcommerz/fail", {
            "tran_id": self.session.tran_id
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.gateway.result = "VALID"
        with patch("payment_service.payments.views.get_sslcommerz_client", return_value=self.gateway):
            response = self.client.post("/api/payment/sslcommerz/ipn", {
                "tran_id": self.session.tran_id, "status": "FAILED"
            }, format="json")
        self.assertEqual(response.status_code, 400)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)
