-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "discount_price" DROP NOT NULL,
ALTER COLUMN "discount_pix" DROP NOT NULL,
ALTER COLUMN "bar_code" DROP NOT NULL;
