from django.urls import path
from .views import (
    HealthView,
    PaymentListView,
    PaymentDetailView,
    RefundView,
    InitiateSSLCommerzPaymentView,
    SSLCommerzIPNView,
    SSLCommerzSuccessView,
    SSLCommerzFailView,
    SSLCommerzCancelView,
    PaymentStatusView,
)

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    path("", PaymentListView.as_view(), name="payment-list"),
    path("status", PaymentStatusView.as_view(), name="payment-status"),
    path("<uuid:payment_id>", PaymentDetailView.as_view(), name="payment-detail"),
    path("<uuid:payment_id>/refund", RefundView.as_view(), name="payment-refund"),
    # SSLCOMMERZ endpoints
    path("sslcommerz/initiate", InitiateSSLCommerzPaymentView.as_view(), name="sslcommerz-initiate"),
    path("sslcommerz/ipn", SSLCommerzIPNView.as_view(), name="sslcommerz-ipn"),
    path("sslcommerz/success", SSLCommerzSuccessView.as_view(), name="sslcommerz-success"),
    path("sslcommerz/fail", SSLCommerzFailView.as_view(), name="sslcommerz-fail"),
    path("sslcommerz/cancel", SSLCommerzCancelView.as_view(), name="sslcommerz-cancel"),
]
