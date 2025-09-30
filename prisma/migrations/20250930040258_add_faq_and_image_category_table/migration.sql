-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "category_image" TEXT,
ADD COLUMN     "category_image_key" TEXT;

-- CreateTable
CREATE TABLE "category_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "category_faqs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "category_faqs" ADD CONSTRAINT "category_faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
