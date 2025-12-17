-- CreateEnum
CREATE TYPE "StoreBenefitType" AS ENUM ('LINK', 'MODAL');

-- CreateTable
CREATE TABLE "store_benefits" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "type" "StoreBenefitType",
    "modal_content" TEXT,
    "link" TEXT,
    "link_text" TEXT,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_by" TEXT,

    CONSTRAINT "store_benefits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "store_benefits" ADD CONSTRAINT "store_benefits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_benefits" ADD CONSTRAINT "store_benefits_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_benefits" ADD CONSTRAINT "store_benefits_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
