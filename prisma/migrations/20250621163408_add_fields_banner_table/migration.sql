/*
  Warnings:

  - You are about to drop the column `desktopImage` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `desktopImageAlt` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `mobileImage` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `mobileImageAlt` on the `banners` table. All the data in the column will be lost.
  - Added the required column `desktop_image_alt` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desktop_image_key` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desktop_image_url` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile_image_alt` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile_image_key` to the `banners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile_image_url` to the `banners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "desktopImage",
DROP COLUMN "desktopImageAlt",
DROP COLUMN "mobileImage",
DROP COLUMN "mobileImageAlt",
ADD COLUMN     "desktop_image_alt" TEXT NOT NULL,
ADD COLUMN     "desktop_image_key" TEXT NOT NULL,
ADD COLUMN     "desktop_image_url" TEXT NOT NULL,
ADD COLUMN     "mobile_image_alt" TEXT NOT NULL,
ADD COLUMN     "mobile_image_key" TEXT NOT NULL,
ADD COLUMN     "mobile_image_url" TEXT NOT NULL;
