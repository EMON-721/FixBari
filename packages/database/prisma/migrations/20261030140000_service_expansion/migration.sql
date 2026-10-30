-- FixBari V1 + V2 operational workflow tables
CREATE TABLE IF NOT EXISTS "expansion_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "payload" JSONB NOT NULL,
  "assigned_technician_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "expansion_requests_customer_id_created_at_idx" ON "expansion_requests"("customer_id", "created_at");
CREATE INDEX IF NOT EXISTS "expansion_requests_status_kind_idx" ON "expansion_requests"("status", "kind");
CREATE INDEX IF NOT EXISTS "expansion_requests_assigned_technician_id_idx" ON "expansion_requests"("assigned_technician_id");
CREATE TABLE IF NOT EXISTS "expansion_events" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "request_id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "expansion_events_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "expansion_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "expansion_events_request_id_created_at_idx" ON "expansion_events"("request_id", "created_at");
CREATE TABLE IF NOT EXISTS "expansion_offers" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "request_id" TEXT NOT NULL,
  "technician_id" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "scope" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "expansion_offers_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "expansion_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "expansion_offers_request_id_technician_id_key" ON "expansion_offers"("request_id", "technician_id");
CREATE INDEX IF NOT EXISTS "expansion_offers_technician_id_idx" ON "expansion_offers"("technician_id");
