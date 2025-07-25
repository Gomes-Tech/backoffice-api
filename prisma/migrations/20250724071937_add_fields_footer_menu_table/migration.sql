/*
  Warnings:

  - Added the required column `isActive` to the `footer_menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "footer_menu" ADD COLUMN     "isActive" BOOLEAN NOT NULL;
