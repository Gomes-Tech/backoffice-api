/*
  Warnings:

  - You are about to drop the column `is_first` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `desktop_image_first` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile_image_first` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "is_first",
ADD COLUMN     "desktop_image_first" BOOLEAN NOT NULL,
ADD COLUMN     "mobile_image_first" BOOLEAN NOT NULL;
