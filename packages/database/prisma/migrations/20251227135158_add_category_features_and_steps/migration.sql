-- CreateTable
CREATE TABLE "category_features" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_steps" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_steps_category_id_step_number_key" ON "category_steps"("category_id", "step_number");

-- AddForeignKey
ALTER TABLE "category_features" ADD CONSTRAINT "category_features_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_steps" ADD CONSTRAINT "category_steps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
