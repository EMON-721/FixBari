# Event Contracts

This directory contains JSON Schema definitions for all events in the FixBari event-driven architecture.

## Event Flow Diagram

```
┌─────────────┐     user.created      ┌────────────────────┐
│ Auth        │ ─────────────────────>│ Notifications      │
│ Service     │                       │ Service            │
└─────────────┘                       └────────────────────┘
                                              ▲
┌─────────────┐     order.placed      ┌───────┴────────────┐
│ Orders      │ ─────────────────────>│                    │
│ Service     │                       │                    │
│             │<────────────────────  │                    │
└─────────────┘   payment.completed   │                    │
       │                              │                    │
       │ order.placed                 │                    │
       ▼                              │                    │
┌─────────────┐   payment.completed   │                    │
│ Payment     │ ─────────────────────>│                    │
│ Service     │                       │                    │
└─────────────┘                       └────────────────────┘
```

## Events

### User Events

| Event | Producer | Consumers | Description |
|-------|----------|-----------|-------------|
| `user.created` | Auth Service | Notifications | New user registered |

### Order Events

| Event | Producer | Consumers | Description |
|-------|----------|-----------|-------------|
| `order.placed` | Orders Service | Payment, Notifications | New order created |
| `order.status_changed` | Orders Service | Notifications | Order status updated |
| `order.completed` | Orders Service | Notifications | Order completed |
| `order.cancelled` | Orders Service | Payment, Notifications | Order cancelled |

### Payment Events

| Event | Producer | Consumers | Description |
|-------|----------|-----------|-------------|
| `payment.completed` | Payment Service | Orders, Notifications | Payment successful |
| `payment.failed` | Payment Service | Orders, Notifications | Payment failed |
| `payment.refunded` | Payment Service | Orders, Notifications | Payment refunded |

## Using Event Schemas

### TypeScript (Node.js services)

Types are already defined in `@local-services/types` package:

```typescript
import { UserCreatedEvent, OrderPlacedEvent, PaymentCompletedEvent } from '@local-services/types';
```

### Python (FastAPI/Django services)

Use `jsonschema` or `pydantic` to validate events:

```python
from jsonschema import validate
import json

with open('contracts/events/user-created.json') as f:
    schema = json.load(f)

event = {
    "eventType": "user.created",
    "timestamp": "2024-01-01T00:00:00Z",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "payload": {
        "userId": "550e8400-e29b-41d4-a716-446655440001",
        "email": "user@example.com",
        "role": "customer"
    }
}

validate(event, schema)  # Raises ValidationError if invalid
```

## Exchange and Queue Configuration

### Exchange
- **Name**: `local-services.events`
- **Type**: Topic
- **Durable**: Yes

### Routing Keys

| Pattern | Example | Description |
|---------|---------|-------------|
| `user.*` | `user.created` | All user events |
| `order.*` | `order.placed` | All order events |
| `payment.*` | `payment.completed` | All payment events |

### Queues

| Queue | Bindings | Consumer |
|-------|----------|----------|
| `notifications.user-events` | `user.*` | Notifications Service |
| `notifications.order-events` | `order.*` | Notifications Service |
| `notifications.payment-events` | `payment.*` | Notifications Service |
| `orders.payment-events` | `payment.*` | Orders Service |
| `payment.order-events` | `order.*` | Payment Service |
