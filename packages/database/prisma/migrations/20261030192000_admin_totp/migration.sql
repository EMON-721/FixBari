CREATE TABLE IF NOT EXISTS "admin_mfa" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "secret_cipher" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "last_used_step" BIGINT NOT NULL DEFAULT -1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_mfa_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "admin_mfa_user_id_key" ON "admin_mfa"("user_id");
DO $$ BEGIN
  ALTER TABLE "admin_mfa" ADD CONSTRAINT "admin_mfa_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
