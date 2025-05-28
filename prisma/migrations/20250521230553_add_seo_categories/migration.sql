-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "seo_canonical_url" TEXT,
ADD COLUMN     "seo_meta_robots" TEXT;

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "seo_canonical_url" TEXT,
ADD COLUMN     "seo_meta_robots" TEXT;
