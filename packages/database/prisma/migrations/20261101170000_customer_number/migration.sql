-- Assign stable, sequential customer-facing account numbers without changing UUID primary keys.
-- Backfill existing accounts first, then require the number for all future users.
CREATE SEQUENCE IF NOT EXISTS "auth_users_customer_number_seq";
ALTER TABLE "auth_users" ADD COLUMN IF NOT EXISTS "customer_number" INTEGER;
UPDATE "auth_users" SET "customer_number" = nextval('"auth_users_customer_number_seq"') WHERE "customer_number" IS NULL;
ALTER TABLE "auth_users" ALTER COLUMN "customer_number" SET DEFAULT nextval('"auth_users_customer_number_seq"');
ALTER TABLE "auth_users" ALTER COLUMN "customer_number" SET NOT NULL;
ALTER SEQUENCE "auth_users_customer_number_seq" OWNED BY "auth_users"."customer_number";
SELECT setval('"auth_users_customer_number_seq"', GREATEST(COALESCE((SELECT MAX("customer_number") FROM "auth_users"), 0), 1), EXISTS (SELECT 1 FROM "auth_users"));
CREATE UNIQUE INDEX IF NOT EXISTS "auth_users_customer_number_key" ON "auth_users"("customer_number");
