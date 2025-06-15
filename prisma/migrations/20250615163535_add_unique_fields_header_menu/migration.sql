/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `header_menu` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order]` on the table `header_menu` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "header_menu" ALTER COLUMN "order" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "header_menu_name_key" ON "header_menu"("name");

-- CreateIndex
CREATE UNIQUE INDEX "header_menu_order_key" ON "header_menu"("order");
