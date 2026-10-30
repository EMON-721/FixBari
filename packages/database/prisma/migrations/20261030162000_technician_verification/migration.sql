-- FixBari: new profiles require explicit review before receiving customer work.
ALTER TABLE "technician_profiles" ADD COLUMN IF NOT EXISTS "verification_status" TEXT NOT NULL DEFAULT 'PENDING';
CREATE INDEX IF NOT EXISTS "technician_profiles_verification_status_idx" ON "technician_profiles"("verification_status");
