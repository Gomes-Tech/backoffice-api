/*
  Warnings:

  - Added the required column `image_alt` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_key` to the `social_media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `social_media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "social_media" ADD COLUMN     "image_alt" TEXT NOT NULL,
ADD COLUMN     "image_key" TEXT NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL;
