from rest_framework import serializers
from .models import Payment, Transaction, Refund


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "type", "amount", "status", "created_at"]


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ["id", "amount", "reason", "status", "created_at"]


class PaymentSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)
    refunds = RefundSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order_id",
            "user_id",
            "amount",
            "currency",
            "status",
            "method",
            "created_at",
            "updated_at",
            "transactions",
            "refunds",
        ]


class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.CharField(max_length=36)
    user_id = serializers.CharField(max_length=36)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    method = serializers.ChoiceField(choices=["card", "bank_transfer", "cash"])
    card_token = serializers.CharField(required=False, allow_blank=True)


class CreateRefundSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    reason = serializers.CharField()
