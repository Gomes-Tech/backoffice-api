-- CreateEnum
CREATE TYPE "FooterMenuItemType" AS ENUM ('LINK', 'IMAGE', 'TEXT');

-- CreateTable
CREATE TABLE "product_variant_attribute_value" (
    "id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "attribute_value_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_by" TEXT,

    CONSTRAINT "footer_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_menu_item" (
    "id" TEXT NOT NULL,
    "type" "FooterMenuItemType" NOT NULL,
    "url" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "imageKey" TEXT,
    "content" TEXT,
    "footerMenuId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "footer_menu_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_attribute_value_product_variant_id_attribut_key" ON "product_variant_attribute_value"("product_variant_id", "attribute_value_id");

-- CreateIndex
CREATE INDEX "footer_menu_item_footerMenuId_idx" ON "footer_menu_item"("footerMenuId");

-- AddForeignKey
ALTER TABLE "product_variant_attribute_value" ADD CONSTRAINT "product_variant_attribute_value_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute_value" ADD CONSTRAINT "product_variant_attribute_value_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_menu" ADD CONSTRAINT "footer_menu_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_menu" ADD CONSTRAINT "footer_menu_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_menu" ADD CONSTRAINT "footer_menu_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_menu_item" ADD CONSTRAINT "footer_menu_item_footerMenuId_fkey" FOREIGN KEY ("footerMenuId") REFERENCES "footer_menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
