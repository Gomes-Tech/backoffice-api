/*
  Warnings:

  - Added the required column `created_by` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_by" TEXT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
