/*
  Warnings:

  - A unique constraint covering the columns `[tax_identifier]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birth_date` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_identifier` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "birth_date" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "tax_identifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "customers_tax_identifier_key" ON "customers"("tax_identifier");
