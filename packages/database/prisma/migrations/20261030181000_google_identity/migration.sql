ALTER TABLE "auth_users" ADD COLUMN IF NOT EXISTS "google_sub" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "auth_users_google_sub_key" ON "auth_users"("google_sub");
