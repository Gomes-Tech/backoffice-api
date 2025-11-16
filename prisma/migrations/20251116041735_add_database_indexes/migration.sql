-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_deleted_is_active_idx" ON "categories"("is_deleted", "is_active");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_tax_identifier_idx" ON "customers"("tax_identifier");

-- CreateIndex
CREATE INDEX "customers_isDeleted_idx" ON "customers"("isDeleted");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_is_deleted_idx" ON "products"("is_deleted");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_deleted_is_active_idx" ON "users"("is_deleted", "is_active");
