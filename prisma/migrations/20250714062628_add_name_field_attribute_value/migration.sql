/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `attribute_value` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `attribute_value` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attribute_value" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attribute_value_name_key" ON "attribute_value"("name");
