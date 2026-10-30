import uuid
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    Payment,
    Transaction,
    SSLCommerzSession,
    PaymentStatus,
    PaymentMethod,
    TransactionType,
    TransactionStatus,
)
from .serializers import PaymentSerializer, CreatePaymentSerializer, CreateRefundSerializer
from .sslcommerz import get_sslcommerz_client, SSLCommerzError
from .permissions import InternalServicePermission
from ..core.rabbitmq import rabbitmq_publisher

logger = logging.getLogger(__name__)


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "healthy", "service": "payment"})


class PaymentListView(APIView):
    permission_classes = [InternalServicePermission]

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response(
                {"success": False, "error": {"message": "user_id required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payments = Payment.objects.filter(user_id=user_id)
        serializer = PaymentSerializer(payments, many=True)

        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "error": {"message": serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        # Create payment
        payment = Payment.objects.create(
            order_id=data["order_id"],
            user_id=data["user_id"],
            amount=data["amount"],
            method=data["method"],
            status=PaymentStatus.PROCESSING,
        )

        # Create transaction record
        Transaction.objects.create(
            payment=payment,
            type=TransactionType.CHARGE,
            amount=data["amount"],
            status=TransactionStatus.PENDING,
        )

        # Do not mark as paid or emit completed events before gateway verification.
        # This endpoint records a pending payment only; use SSLCommerz initiation
        # and verified gateway callbacks for electronic settlement.

        return Response(
            {"success": True, "data": PaymentSerializer(payment).data},
            status=status.HTTP_201_CREATED,
        )


class PaymentDetailView(APIView):
    permission_classes = [InternalServicePermission]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Payment not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentSerializer(payment)
        return Response({"success": True, "data": serializer.data})


class RefundView(APIView):
    permission_classes = [InternalServicePermission]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Payment not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment.status != PaymentStatus.COMPLETED:
            return Response(
                {"success": False, "error": {"message": "Payment cannot be refunded"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CreateRefundSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "error": {"message": serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        if data["amount"] > payment.amount:
            return Response(
                {"success": False, "error": {"message": "Refund amount exceeds payment"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # A refund request is never completed merely by creating a database row.
        # Settlement requires provider refund integration + reconciliation.
        from .models import Refund
        refunded_or_pending = sum(r.amount for r in payment.refunds.all() if r.status in ("pending", "completed"))
        if data["amount"] + refunded_or_pending > payment.amount:
            return Response(
                {"success": False, "error": {"message": "Refund exceeds unsettled balance"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        refund = Refund.objects.create(
            payment=payment, amount=data["amount"], reason=data["reason"], status="pending"
        )

        return Response(
            {"success": True, "data": PaymentSerializer(payment).data},
            status=status.HTTP_200_OK,
        )


class InitiateSSLCommerzPaymentView(APIView):
    permission_classes = [InternalServicePermission]

    """
    Initiate a new SSLCOMMERZ payment session

    POST /api/payments/sslcommerz/initiate

    Request body:
        order_id: str - Order ID from orders service
        booking_id: str - Booking ID (BK-XXXXXX format)
        user_id: str - User ID
        amount: float - Payment amount
        currency: str - Currency code (default: BDT)
        customer_name: str - Customer's full name
        customer_email: str - Customer's email
        customer_phone: str - Customer's phone
        customer_address: dict - Address with area, city, division, postalCode
        service_description: str - Description of the service

    Response:
        paymentId: str - UUID of created payment
        sessionId: str - SSLCOMMERZ session key
        gatewayUrl: str - URL to redirect user to
        tranId: str - Transaction ID
        expiresAt: str - ISO timestamp of session expiry
    """

    def post(self, request):
        data = request.data

        # Validate required fields
        required_fields = [
            "order_id",
            "booking_id",
            "user_id",
            "amount",
            "customer_name",
            "customer_email",
            "customer_phone",
            "service_description",
        ]
        for field in required_fields:
            if field not in data:
                return Response(
                    {"success": False, "error": {"message": f"{field} is required"}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Create Payment record
        payment = Payment.objects.create(
            order_id=data["order_id"],
            user_id=data["user_id"],
            amount=data["amount"],
            currency=data.get("currency", "BDT"),
            method=PaymentMethod.SSLCOMMERZ,
            status=PaymentStatus.PENDING,
            metadata={
                "booking_id": data["booking_id"],
                "customer_name": data["customer_name"],
                "customer_email": data["customer_email"],
            },
        )

        # Generate unique transaction ID: FB-{bookingId}-{random}
        tran_id = f"FB-{data['booking_id']}-{uuid.uuid4().hex[:8].upper()}"

        try:
            # Get SSLCOMMERZ client
            client = get_sslcommerz_client()

            # Build callback URLs
            base_url = settings.PAYMENT_BASE_URL
            web_base_url = settings.WEB_APP_BASE_URL

            success_url = f"{web_base_url}/book/payment/success?tran_id={tran_id}"
            fail_url = f"{web_base_url}/book/payment/failed?tran_id={tran_id}"
            cancel_url = f"{web_base_url}/book/payment/cancelled?tran_id={tran_id}"
            ipn_url = f"{base_url}/api/payments/sslcommerz/ipn"

            # Parse customer address
            address = data.get("customer_address", {})
            customer_address = f"{address.get('area', '')}, {address.get('city', '')}"

            # Create SSLCOMMERZ session
            response = client.create_session(
                tran_id=tran_id,
                amount=float(data["amount"]),
                currency=data.get("currency", "BDT"),
                customer_name=data["customer_name"],
                customer_email=data["customer_email"],
                customer_phone=data["customer_phone"],
                customer_address=customer_address,
                customer_city=address.get("city", "Dhaka"),
                customer_postcode=address.get("postalCode", "1000"),
                customer_country="Bangladesh",
                product_name=data["service_description"],
                product_category="Service",
                success_url=success_url,
                fail_url=fail_url,
                cancel_url=cancel_url,
                ipn_url=ipn_url,
            )

            # Create session record
            expires_at = datetime.utcnow() + timedelta(minutes=20)
            session = SSLCommerzSession.objects.create(
                payment=payment,
                session_key=response.get("sessionkey", ""),
                gateway_url=response.get("GatewayPageURL", ""),
                tran_id=tran_id,
                expires_at=expires_at,
                status="pending",
            )

            # Update payment status
            payment.status = PaymentStatus.PROCESSING
            payment.save()

            # Create transaction record
            Transaction.objects.create(
                payment=payment,
                type=TransactionType.CHARGE,
                amount=data["amount"],
                status=TransactionStatus.PENDING,
                provider_response=response,
            )

            # Publish session created event
            try:
                rabbitmq_publisher.publish(
                    "payment.session_created",
                    {
                        "eventType": "payment.session_created",
                        "timestamp": datetime.utcnow().isoformat(),
                        "correlationId": str(uuid.uuid4()),
                        "payload": {
                            "orderId": data["order_id"],
                            "bookingId": data["booking_id"],
                            "paymentId": str(payment.id),
                            "sessionId": session.session_key,
                            "gatewayUrl": session.gateway_url,
                            "tranId": tran_id,
                            "expiresAt": expires_at.isoformat(),
                        },
                    },
                )
            except Exception as e:
                logger.error(f"Failed to publish payment.session_created event: {e}")

            return Response(
                {
                    "success": True,
                    "data": {
                        "paymentId": str(payment.id),
                        "sessionId": session.session_key,
                        "gatewayUrl": session.gateway_url,
                        "tranId": tran_id,
                        "expiresAt": expires_at.isoformat(),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except SSLCommerzError as e:
            payment.status = PaymentStatus.FAILED
            payment.save()
            logger.error(f"SSLCOMMERZ session creation failed: {e}")
            return Response(
                {"success": False, "error": {"message": str(e)}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            payment.status = PaymentStatus.FAILED
            payment.save()
            logger.error(f"Unexpected error during payment initiation: {e}")
            return Response(
                {"success": False, "error": {"message": "Payment initiation failed"}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@method_decorator(csrf_exempt, name="dispatch")
class SSLCommerzIPNView(APIView):
    """
    IPN (Instant Payment Notification) handler for SSLCOMMERZ

    POST /api/payments/sslcommerz/ipn

    Called by SSLCOMMERZ when payment status changes.
    This endpoint must be CSRF exempt as it's called externally.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data
        logger.info("Received payment gateway IPN callback for transaction reference")

        tran_id = data.get("tran_id")
        val_id = data.get("val_id")
        status_code = data.get("status")

        if not tran_id:
            logger.warning("IPN callback missing tran_id")
            return Response({"status": "error", "message": "Missing tran_id"})

        try:
            session = SSLCommerzSession.objects.get(tran_id=tran_id)
        except SSLCommerzSession.DoesNotExist:
            logger.warning(f"IPN callback for unknown tran_id: {tran_id}")
            return Response({"status": "error", "message": "Session not found"})

        # Prevent duplicate processing
        if session.ipn_received and session.status in ["valid", "failed", "cancelled"]:
            logger.info(f"IPN already processed for tran_id: {tran_id}")
            return Response({"status": "already_processed"})

        payment = session.payment

        if status_code == "VALID" and val_id:
            try:
                # Validate transaction with SSLCOMMERZ
                client = get_sslcommerz_client()
                validation = client.validate_transaction(val_id)

                if (
                    validation.get("status") in ["VALID", "VALIDATED"]
                    and validation.get("tran_id") == tran_id
                    and validation.get("currency", payment.currency) == payment.currency
                ):
                    # Verify amount matches
                    received_amount = float(validation.get("amount", 0))
                    expected_amount = float(payment.amount)

                    if not client.verify_amount(expected_amount, received_amount):
                        logger.warning(
                            f"Amount mismatch for {tran_id}: expected {expected_amount}, got {received_amount}"
                        )
                        return Response(
                            {"status": "error", "message": "Gateway amount mismatch"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    # Update session
                    session.val_id = val_id
                    session.bank_tran_id = data.get("bank_tran_id")
                    session.card_type = data.get("card_type")
                    session.card_brand = data.get("card_brand")
                    session.store_amount = data.get("store_amount")
                    session.status = "valid"
                    session.ipn_received = True
                    session.ipn_payload = dict(data)
                    session.save()

                    # Update payment
                    payment.status = PaymentStatus.COMPLETED
                    payment.save()

                    # Update transaction
                    transaction = payment.transactions.first()
                    if transaction:
                        transaction.status = TransactionStatus.SUCCESS
                        transaction.provider_response = dict(data)
                        transaction.save()

                    # Publish payment completed event
                    try:
                        rabbitmq_publisher.publish(
                            "payment.completed",
                            {
                                "eventType": "payment.completed",
                                "timestamp": datetime.utcnow().isoformat(),
                                "correlationId": str(uuid.uuid4()),
                                "payload": {
                                    "paymentId": str(payment.id),
                                    "orderId": payment.order_id,
                                    "bookingId": payment.metadata.get("booking_id"),
                                    "userId": payment.user_id,
                                    "amount": float(payment.amount),
                                    "storeAmount": float(data.get("store_amount", payment.amount)),
                                    "currency": payment.currency,
                                    "method": data.get("card_type", "sslcommerz"),
                                    "tranId": tran_id,
                                    "valId": val_id,
                                    "bankTranId": data.get("bank_tran_id"),
                                    "cardType": data.get("card_type"),
                                    "cardBrand": data.get("card_brand"),
                                },
                            },
                        )
                    except Exception as e:
                        logger.error(f"Failed to publish payment.completed event: {e}")

                    logger.info(f"Payment completed for tran_id: {tran_id}")
                    return Response({"status": "success"})

            except SSLCommerzError as e:
                logger.error(f"Validation failed for {tran_id}: {e}")

        elif status_code in ["FAILED", "CANCELLED"]:
            # Failure/cancellation IPNs are unauthenticated public callbacks.
            # Check the transaction status with the gateway before mutating state.
            try:
                client = get_sslcommerz_client()
                gateway = client.query_transaction(tran_id)
                if (gateway.get("status") != status_code or
                        gateway.get("tran_id") != tran_id):
                    return Response({"status": "error", "message": "Unverified payment status"}, status=400)
            except SSLCommerzError:
                return Response({"status": "error", "message": "Unable to verify payment status"}, status=503)
            session.status = status_code.lower()
            session.ipn_received = True
            session.ipn_payload = dict(data)
            session.save()

            payment.status = PaymentStatus.FAILED
            payment.save()

            event_type = "payment.failed" if status_code == "FAILED" else "payment.cancelled"

            try:
                rabbitmq_publisher.publish(
                    event_type,
                    {
                        "eventType": event_type,
                        "timestamp": datetime.utcnow().isoformat(),
                        "correlationId": str(uuid.uuid4()),
                        "payload": {
                            "paymentId": str(payment.id),
                            "orderId": payment.order_id,
                            "bookingId": payment.metadata.get("booking_id"),
                            "userId": payment.user_id,
                            "reason": data.get("error", status_code),
                            "tranId": tran_id,
                            "failedReason": data.get("failedreason"),
                        },
                    },
                )
            except Exception as e:
                logger.error(f"Failed to publish {event_type} event: {e}")

            logger.info(f"Payment {status_code.lower()} for tran_id: {tran_id}")

        return Response({"status": "received"})


@method_decorator(csrf_exempt, name="dispatch")
class SSLCommerzSuccessView(APIView):
    """
    Handle success redirect from SSLCOMMERZ

    POST /api/payments/sslcommerz/success

    SSLCOMMERZ redirects users here after successful payment.
    This endpoint validates the payment if IPN hasn't been received yet.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        tran_id = request.data.get("tran_id")
        val_id = request.data.get("val_id")

        if not tran_id:
            return Response(
                {"success": False, "error": {"message": "Missing tran_id"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            session = SSLCommerzSession.objects.select_related("payment").get(tran_id=tran_id)

            # If IPN hasn't been received yet, validate manually
            if not session.ipn_received and val_id:
                try:
                    client = get_sslcommerz_client()
                    validation = client.validate_transaction(val_id)

                    if (
                        validation.get("status") in ["VALID", "VALIDATED"]
                        and validation.get("tran_id") == tran_id
                        and validation.get("currency", session.payment.currency) == session.payment.currency
                        and client.verify_amount(
                            float(session.payment.amount), float(validation.get("amount", 0))
                        )
                    ):
                        session.val_id = val_id
                        session.status = "valid"
                        session.save()

                        payment = session.payment
                        if payment.status != PaymentStatus.COMPLETED:
                            payment.status = PaymentStatus.COMPLETED
                            payment.save()

                            # Publish event if IPN hasn't done so
                            try:
                                rabbitmq_publisher.publish(
                                    "payment.completed",
                                    {
                                        "eventType": "payment.completed",
                                        "timestamp": datetime.utcnow().isoformat(),
                                        "correlationId": str(uuid.uuid4()),
                                        "payload": {
                                            "paymentId": str(payment.id),
                                            "orderId": payment.order_id,
                                            "bookingId": payment.metadata.get("booking_id"),
                                            "userId": payment.user_id,
                                            "amount": float(payment.amount),
                                            "storeAmount": float(payment.amount),
                                            "currency": payment.currency,
                                            "method": "sslcommerz",
                                            "tranId": tran_id,
                                            "valId": val_id,
                                        },
                                    },
                                )
                            except Exception as e:
                                logger.error(f"Failed to publish payment.completed event: {e}")

                except SSLCommerzError as e:
                    logger.error(f"Validation failed in success handler: {e}")

            return Response(
                {
                    "success": True,
                    "data": {
                        "bookingId": session.payment.metadata.get("booking_id"),
                        "orderId": session.payment.order_id,
                        "tranId": tran_id,
                        "status": session.payment.status,
                    },
                }
            )

        except SSLCommerzSession.DoesNotExist:
            return Response(
                {"success": False, "error": {"message": "Session not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )


@method_decorator(csrf_exempt, name="dispatch")
class SSLCommerzFailView(APIView):
    """Handle failure redirect from SSLCOMMERZ"""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        tran_id = request.data.get("tran_id")

        # A browser redirect can be forged and must never mutate payment state.
        # The gateway-verified IPN/query controls actual settlement status.

        return Response(
            {
                "success": False,
                "data": {
                    "status": "failed",
                    "tranId": tran_id,
                },
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
class SSLCommerzCancelView(APIView):
    """Handle cancellation redirect from SSLCOMMERZ"""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        tran_id = request.data.get("tran_id")

        # A browser redirect can be forged and must never mutate payment state.
        # The gateway-verified IPN/query controls actual settlement status.

        return Response(
            {
                "success": False,
                "data": {
                    "status": "cancelled",
                    "tranId": tran_id,
                },
            }
        )


class PaymentStatusView(APIView):
    """Public return-page check; transaction IDs are random, no PII is returned.

    A browser callback can only show `completed` if the payment service recorded a
    gateway-verified settlement. Do not trust success-page query arguments.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        tran_id = request.query_params.get("tran_id")
        if not tran_id or len(tran_id) > 100:
            return Response({"success": False, "error": {"message": "tran_id required"}}, status=400)
        try:
            session = SSLCommerzSession.objects.select_related("payment").get(tran_id=tran_id)
        except SSLCommerzSession.DoesNotExist:
            return Response({"success": False, "error": {"message": "Payment not found"}}, status=404)
        return Response({"success": True, "data": {"status": session.payment.status}})
