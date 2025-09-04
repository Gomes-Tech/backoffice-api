/*
  Warnings:

  - You are about to drop the column `productId` on the `product_faq` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product_faq" DROP CONSTRAINT "product_faq_productId_fkey";

-- AlterTable
ALTER TABLE "product_faq" DROP COLUMN "productId",
ADD COLUMN     "product_id" TEXT;

-- CreateTable
CREATE TABLE "related_products" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "related_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "similar_products" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "similar_products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_faq" ADD CONSTRAINT "product_faq_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "similar_products" ADD CONSTRAINT "similar_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
