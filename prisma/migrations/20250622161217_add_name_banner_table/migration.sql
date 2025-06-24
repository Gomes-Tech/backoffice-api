/*
  Warnings:

  - Added the required column `name` to the `banners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "name" TEXT NOT NULL;
