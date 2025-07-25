-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "seo_canonical_url" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_keywords" TEXT,
ADD COLUMN     "seo_meta_robots" TEXT,
ADD COLUMN     "seo_title" TEXT;
