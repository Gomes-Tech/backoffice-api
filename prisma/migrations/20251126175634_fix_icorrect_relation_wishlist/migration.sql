/*
  Warnings:

  - You are about to drop the column `product_variant_id` on the `WishlistItem` table. All the data in the column will be lost.
  - Added the required column `product_id` to the `WishlistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_product_variant_id_fkey";

-- AlterTable
ALTER TABLE "WishlistItem" DROP COLUMN "product_variant_id",
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
