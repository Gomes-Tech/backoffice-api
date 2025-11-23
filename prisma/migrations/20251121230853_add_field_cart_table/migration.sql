/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `carts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "converted_at" TIMESTAMP(3),
ADD COLUMN     "converted_total" INTEGER,
ADD COLUMN     "last_item_added_at" TIMESTAMP(3),
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "carts_order_id_key" ON "carts"("order_id");

-- CreateIndex
CREATE INDEX "carts_status_idx" ON "carts"("status");

-- CreateIndex
CREATE INDEX "carts_last_item_added_at_idx" ON "carts"("last_item_added_at");

-- CreateIndex
CREATE INDEX "carts_converted_at_idx" ON "carts"("converted_at");

-- CreateIndex
CREATE INDEX "carts_order_id_idx" ON "carts"("order_id");
