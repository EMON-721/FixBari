from django.urls import path, include

urlpatterns = [
    path("api/payment/", include("payment_service.payments.urls")),
]
