-- AlterTable
ALTER TABLE "store_benefits" ADD COLUMN     "image_key" TEXT,
ADD COLUMN     "image_url" TEXT,
ALTER COLUMN "subtitle" DROP NOT NULL;
