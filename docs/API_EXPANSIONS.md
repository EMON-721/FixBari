# FixBari V3 — Expansion API contract

Base: `/api/orders/expansions`. All endpoints need a valid JWT Bearer token from the existing Auth service. User ownership and role checks are enforced in the route.

| Action | Method and route | Roles | Purpose |
|---|---|---|---|
| Estimate | `POST /estimate` | CUSTOMER, ADMIN | Service-based rule estimate |
| Create request | `POST /` | CUSTOMER, ADMIN | EMERGENCY, QUOTE, PROPERTY, APPLIANCE, SUPPORT, INSPECTION, CONTRACT |
| List requests | `GET /` | All authenticated | Customer own; technician assigned; admin all |
| Detail & events | `GET /:id` | Owner, assignee, ADMIN | Read request plus offers/history |
| Change status | `PATCH /:id/status` | ADMIN | Transition with event trail |
| Submit offer | `POST /:id/offers` | TECHNICIAN, ADMIN | Upsert quote offer |
| Select offer | `POST /:id/offers/:offerId/select` | Owner, ADMIN | Assign selected provider |

A request payload should contain the relevant fields: emergency requires `service`, `area`, `description`; quote requires `subject`, `scope`. Request payloads are size-limited, but each specialized request requires deeper validation before production rollout. Store no real NID or payment card values in generic JSON payloads.

## Example create quote

```json
{
  "kind": "QUOTE",
  "payload": {
    "subject": "Repair a leaking pipe",
    "scope": "Kitchen pipe repair and materials estimate",
    "district": "Dhaka"
  }
}
```

## Estimation example

```json
{
  "serviceId": "UUID_FROM_CATALOG",
  "complexity": "MODERATE",
  "tier": "STANDARD",
  "district": "Dhaka"
}
```

The estimator returns an indicative range; it is not a trained AI model. Payment processing, KYC data, notification delivery, technician scheduling and files require separate vetted services. Manual Admin assignment requires checking real technician verification and service area before rollout.
