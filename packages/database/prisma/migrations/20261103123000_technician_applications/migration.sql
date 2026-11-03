CREATE TABLE "technician_applications" (
 "id" TEXT NOT NULL,
 "user_id" TEXT NOT NULL,
 "technician_number" SERIAL NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING',
 "service_areas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "experience" VARCHAR(1000),
 "reviewed_by" TEXT,
 "reviewed_at" TIMESTAMP(3),
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "technician_applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "technician_applications_user_id_key" ON "technician_applications"("user_id");
CREATE UNIQUE INDEX "technician_applications_technician_number_key" ON "technician_applications"("technician_number");
CREATE INDEX "technician_applications_status_created_at_idx" ON "technician_applications"("status", "created_at");
ALTER TABLE "technician_applications" ADD CONSTRAINT "technician_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
