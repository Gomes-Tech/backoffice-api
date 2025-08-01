/*
  Warnings:

  - You are about to drop the column `image_alt` on the `social_media` table. All the data in the column will be lost.
  - You are about to drop the column `image_key` on the `social_media` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `social_media` table. All the data in the column will be lost.
  - Added the required column `footer_image_alt` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `footer_image_key` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `footer_image_url` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `header_image_alt` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `header_image_key` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `header_image_url` to the `social_media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "social_media" DROP COLUMN "image_alt",
DROP COLUMN "image_key",
DROP COLUMN "image_url",
ADD COLUMN     "footer_image_alt" TEXT NOT NULL,
ADD COLUMN     "footer_image_key" TEXT NOT NULL,
ADD COLUMN     "footer_image_url" TEXT NOT NULL,
ADD COLUMN     "header_image_alt" TEXT NOT NULL,
ADD COLUMN     "header_image_key" TEXT NOT NULL,
ADD COLUMN     "header_image_url" TEXT NOT NULL;
