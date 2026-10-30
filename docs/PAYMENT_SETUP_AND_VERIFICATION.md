# FixBari — SSLCOMMERZ setup and verification

The original Django-based gateway is preserved. The Orders backend initiates payment sessions using an internal service token; browser code must never receive merchant credentials or that token.

## Hosting environment (backend only)

Provide these through your own hosting dashboard, **never in GitHub**:

- \`PAYMENT_INTERNAL_TOKEN\`: same strong random secret on Orders and Payment
- \`PAYMENT_SERVICE_URL\`: \`http://payment:3004/api/payment\` on Docker Compose or your private Payment API URL
- \`SSLCOMMERZ_STORE_ID\`, \`SSLCOMMERZ_STORE_PASSWORD\`
- \`SSLCOMMERZ_ENVIRONMENT=sandbox\` for integration verification, switch to live only after merchant approval
- \`PAYMENT_BASE_URL\`: public HTTPS origin where \`/api/payment/sslcommerz/ipn\` is reachable
- \`WEB_APP_BASE_URL\`: public HTTPS origin of the customer application
- \`DJANGO_SECRET_KEY\`, \`DATABASE_URL\`, \`RABBITMQ_URL\`, \`ALLOWED_HOSTS\`

The old sample keys \`SSL_STORE_ID\` and \`SSL_STORE_PASSWORD\` are not recognized by the Django settings; use SSLCOMMERZ-prefixed keys instead.

## Expected verified payment flow

1. Orders calculates the service price and initiates a gateway session through the private payment API.
2. Customer is redirected to the gateway.
3. Django verifies the gateway response, transaction reference, currency and amount on the server.
4. Only a verified callback marks payment completed. Invalid gateway amounts or forged redirects never settle a payment.
5. Customer return pages ask the server for the recorded status.
6. Refund requests remain pending until gateway refund and reconciliation have been verified.

## Test scope

GitHub Actions tests PostgreSQL/Prisma migrations, Django migrations and four mocked Django payment security scenarios, with no real merchant key, card or mobile-wallet transaction. Configure a real **sandbox** merchant account to test actual success, failure, cancel, duplicate IPN, timeouts, refunds and reconciliation. Never infer a live payment pass from mock tests.
