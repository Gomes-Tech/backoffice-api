-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_green_seal" BOOLEAN NOT NULL,
    "free_shipping" BOOLEAN NOT NULL,
    "immediate_shipping" BOOLEAN NOT NULL,
    "is_personalized" BOOLEAN NOT NULL,
    "is_exclusive" BOOLEAN NOT NULL,
    "in_cutout" BOOLEAN NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "seo_canonical_url" TEXT,
    "seo_meta_robots" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sku" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "discount_price" TEXT NOT NULL,
    "discount_pix" TEXT NOT NULL,
    "stock" INTEGER,
    "weight" TEXT NOT NULL,
    "length" TEXT NOT NULL,
    "width" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "bar_code" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "desktop_image_url" TEXT NOT NULL,
    "desktop_image_alt" TEXT NOT NULL,
    "desktop_image_key" TEXT NOT NULL,
    "mobile_image_url" TEXT NOT NULL,
    "mobile_image_alt" TEXT NOT NULL,
    "mobile_image_key" TEXT NOT NULL,
    "is_first" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "_ProductCategories_B_index" ON "_ProductCategories"("B");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
