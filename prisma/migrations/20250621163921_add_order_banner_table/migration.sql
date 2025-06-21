/*
  Warnings:

  - Added the required column `order` to the `banners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "order" INTEGER NOT NULL;
