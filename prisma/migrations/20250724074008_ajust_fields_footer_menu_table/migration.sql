/*
  Warnings:

  - Changed the type of `type` on the `footer_menu_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "footer_menu_item" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "FooterMenuItemType";
