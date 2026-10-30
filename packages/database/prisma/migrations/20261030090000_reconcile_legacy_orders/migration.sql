-- Reconcile the 2025 base schema with current bookings and technician tables.
-- Additive migration; preserves existing rows. Runs before the V1/V2 expansions.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceTier') THEN
  CREATE TYPE "ServiceTier" AS ENUM ('STANDARD','PREMIUM','DELUXE');
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
  CREATE TYPE "PaymentMethod" AS ENUM ('COD','ONLINE');
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','INITIATED','COMPLETED','FAILED','REFUNDED');
 END IF;
END $$;

ALTER TABLE "orders"
 ADD COLUMN IF NOT EXISTS "booking_id" TEXT,
 ADD COLUMN IF NOT EXISTS "base_amount" DECIMAL(10,2),
 ADD COLUMN IF NOT EXISTS "tier" "ServiceTier" NOT NULL DEFAULT 'STANDARD',
 ADD COLUMN IF NOT EXISTS "tier_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
 ADD COLUMN IF NOT EXISTS "area_size" TEXT,
 ADD COLUMN IF NOT EXISTS "scheduled_time" TEXT,
 ADD COLUMN IF NOT EXISTS "assigned_at" TIMESTAMP(3),
 ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3),
 ADD COLUMN IF NOT EXISTS "additional_info" TEXT,
 ADD COLUMN IF NOT EXISTS "payment_method" "PaymentMethod" NOT NULL DEFAULT 'COD',
 ADD COLUMN IF NOT EXISTS "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
 ADD COLUMN IF NOT EXISTS "payment_id" TEXT,
 ADD COLUMN IF NOT EXISTS "payment_session_id" TEXT,
 ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);
UPDATE "orders" SET "booking_id" = 'FB-' || id WHERE "booking_id" IS NULL;
UPDATE "orders" SET "base_amount" = "total_amount" WHERE "base_amount" IS NULL;
ALTER TABLE "orders" ALTER COLUMN "booking_id" SET NOT NULL, ALTER COLUMN "base_amount" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "orders_booking_id_key" ON "orders"("booking_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_technician_id_idx" ON "orders"("technician_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_scheduled_date_idx" ON "orders"("scheduled_date");
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders"("created_at");

ALTER TABLE "order_addresses"
 ADD COLUMN IF NOT EXISTS "area" TEXT,
 ADD COLUMN IF NOT EXISTS "division" TEXT,
 ADD COLUMN IF NOT EXISTS "postal_code" TEXT;
UPDATE "order_addresses" SET
 "area" = COALESCE("area", "street", ''),
 "division" = COALESCE("division", "state", ''),
 "postal_code" = COALESCE("postal_code", "zip_code", '');
ALTER TABLE "order_addresses"
 ALTER COLUMN "area" SET NOT NULL,
 ALTER COLUMN "division" SET NOT NULL,
 ALTER COLUMN "postal_code" SET NOT NULL,
 ALTER COLUMN "street" DROP NOT NULL,
 ALTER COLUMN "state" DROP NOT NULL,
 ALTER COLUMN "zip_code" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "order_history" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "order_id" TEXT NOT NULL,
 "from_status" "OrderStatus",
 "to_status" "OrderStatus" NOT NULL,
 "changed_by" TEXT NOT NULL,
 "changed_by_role" TEXT NOT NULL,
 "reason" TEXT,
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "order_history_order_id_fkey"
 FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "order_history_order_id_idx" ON "order_history"("order_id");

CREATE TABLE IF NOT EXISTS "technician_profiles" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "first_name" TEXT NOT NULL,
 "last_name" TEXT NOT NULL,
 "phone" TEXT,
 "avatar" TEXT,
 "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
 "total_jobs" INTEGER NOT NULL DEFAULT 0,
 "completed_jobs" INTEGER NOT NULL DEFAULT 0,
 "is_available" BOOLEAN NOT NULL DEFAULT true,
 "service_areas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "technician_availability" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "technician_id" TEXT NOT NULL,
 "day_of_week" INTEGER NOT NULL,
 "start_time" TEXT NOT NULL,
 "end_time" TEXT NOT NULL,
 "is_available" BOOLEAN NOT NULL DEFAULT true,
 CONSTRAINT "technician_availability_technician_id_fkey"
 FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "technician_availability_technician_id_day_of_week_key"
 ON "technician_availability"("technician_id", "day_of_week");
