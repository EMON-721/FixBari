-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- AlterTable: First add nullable columns
ALTER TABLE "services"
ADD COLUMN "icon" TEXT,
ADD COLUMN "slug" TEXT,
ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "category_id" TEXT;

-- Update existing services: Generate slugs and default category
UPDATE "services" SET "slug" = LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'));

-- Insert a default category for existing services
INSERT INTO "service_categories" ("id", "name", "slug", "is_active", "sort_order", "updated_at")
VALUES ('default-category', 'Uncategorized', 'uncategorized', true, 0, CURRENT_TIMESTAMP);

-- Link existing services to the default category
UPDATE "services" SET "category_id" = 'default-category' WHERE "category_id" IS NULL;

-- Now make the columns non-nullable
ALTER TABLE "services"
ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "category_id" SET NOT NULL;

-- Drop the old category column
ALTER TABLE "services" DROP COLUMN "category";

-- CreateIndex
CREATE UNIQUE INDEX "services_category_id_slug_key" ON "services"("category_id", "slug");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
