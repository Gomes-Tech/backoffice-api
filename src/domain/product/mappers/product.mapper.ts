import { Prisma } from '@prisma/client';

import {
  AttributeProduct,
  AttributeValueProduct,
  Product,
  ProductAdmin,
  ProductImage,
  ProductVariant,
  ProductVariantAdmin,
  ProductVariantAttributeValue,
} from '../entities';

type ProductWithRelations = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    isExclusive: true;
    isGreenSeal: true;
    isPersonalized: true;
    immediateShipping: true;
    freeShipping: true;
    similarProducts: { select: { id: true } };
    relatedProducts: { select: { id: true } };
    categories: { select: { id: true } };
    videoLink: true;
    seoTitle: true;
    seoCanonicalUrl: true;
    seoDescription: true;
    seoKeywords: true;
    seoMetaRobots: true;
    technicalInfo: true;
    description: true;
    inCutout: true;
    productVariants: {
      select: {
        id: true;
        price: true;
        barCode: true;
        length: true;
        productImage: {
          select: {
            desktopImageUrl: true;
            desktopImageFirst: true;
            mobileImageUrl: true;
            mobileImageFirst: true;
          };
        };
        discountPix: true;
        discountPrice: true;
        weight: true;
        sku: true;
        stock: true;
        width: true;
        isActive: true;
        height: true;
        productVariantAttributes: { select: { attributeValueId: true } };
        seoCanonicalUrl: true;
        seoDescription: true;
        seoKeywords: true;
        seoMetaRobots: true;
        seoTitle: true;
      };
    };
  };
}>;

type ProductWithRelationsView = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    isExclusive: true;
    isGreenSeal: true;
    isPersonalized: true;
    immediateShipping: true;
    freeShipping: true;
    categories: { select: { id: true; name: true; slug: true } };
    videoLink: true;
    seoTitle: true;
    seoCanonicalUrl: true;
    seoDescription: true;
    seoKeywords: true;
    seoMetaRobots: true;
    technicalInfo: true;
    description: true;
    inCutout: true;
    productFAQ: { select: { id: true; question: true; answer: true } };
    productVariants: {
      select: {
        id: true;
        price: true;
        barCode: true;
        length: true;
        productImage: {
          select: {
            id: true;
            desktopImageUrl: true;
            desktopImageAlt: true;
            desktopImageFirst: true;
            mobileImageUrl: true;
            mobileImageAlt: true;
            mobileImageFirst: true;
          };
        };
        discountPix: true;
        discountPrice: true;
        weight: true;
        sku: true;
        stock: true;
        width: true;
        isActive: true;
        height: true;
        productVariantAttributes: {
          select: {
            id: true;
            attributeValue: {
              select: {
                id: true;
                name: true;
                value: true;
                attribute: {
                  select: {
                    id: true;
                    name: true;
                  };
                };
              };
            };
          };
        };
        seoCanonicalUrl: true;
        seoDescription: true;
        seoKeywords: true;
        seoMetaRobots: true;
        seoTitle: true;
      };
    };
  };
}>;

export class ProductMapper {
  static toAdmin(product: ProductWithRelations): ProductAdmin {
    return new ProductAdmin(
      product.id,
      product.name,
      product.slug,
      product.isGreenSeal,
      product.freeShipping,
      product.immediateShipping,
      product.isPersonalized,
      product.isExclusive,
      product.inCutout,
      product.categories.map((c) => c.id),
      product.productVariants.map((pv) => this.mapVariantToAdmin(pv)),
      product.description ?? undefined,
      product.technicalInfo ?? undefined,
      product.videoLink ?? undefined,
      product.seoTitle ?? undefined,
      product.seoDescription ?? undefined,
      product.seoKeywords ?? undefined,
      product.seoCanonicalUrl ?? undefined,
      product.seoMetaRobots ?? undefined,
      product.similarProducts?.map((sp) => sp.id) ?? [],
      product.relatedProducts?.map((rp) => rp.id) ?? [],
    );
  }

  private static mapVariantToAdmin(
    variant: ProductWithRelations['productVariants'][number],
  ): ProductVariantAdmin {
    return new ProductVariantAdmin(
      variant.id,
      variant.price,
      variant.sku,
      variant.isActive,
      variant.discountPrice ?? '',
      variant.discountPix ?? '',
      variant.weight,
      variant.length,
      variant.width,
      variant.height,
      variant.barCode ?? '',
      variant.productImage.map((img) => ({
        desktopImageUrl: img.desktopImageUrl,
        mobileImageUrl: img.mobileImageUrl,
        desktopImageFirst: img.desktopImageFirst,
        mobileImageFirst: img.mobileImageFirst,
      })),
      variant.productVariantAttributes.map((attr) => attr.attributeValueId),
      variant.stock ?? undefined,
      variant.seoTitle ?? undefined,
      variant.seoDescription ?? undefined,
      variant.seoKeywords ?? undefined,
      variant.seoCanonicalUrl ?? undefined,
      variant.seoMetaRobots ?? undefined,
    );
  }

  static toView(product: ProductWithRelationsView): Product {
    return new Product(
      product.id,
      product.name,
      product.slug,
      product.isGreenSeal,
      product.freeShipping,
      product.immediateShipping,
      product.isPersonalized,
      product.isExclusive,
      product.inCutout,
      product.productVariants.map((pv) => this.mapVariantToView(pv)),
      product.categories,
      product.description ?? undefined,
      product.technicalInfo ?? undefined,
      product.videoLink ?? undefined,
      product.seoTitle ?? undefined,
      product.seoDescription ?? undefined,
      product.seoKeywords ?? undefined,
      product.seoCanonicalUrl ?? undefined,
      product.seoMetaRobots ?? undefined,
    );
  }

  private static mapVariantToView(
    variant: ProductWithRelationsView['productVariants'][number],
  ): ProductVariant {
    return new ProductVariant(
      variant.id,
      variant.price,
      variant.sku,
      variant.isActive,
      variant.discountPrice ?? null,
      variant.discountPix ?? null,
      variant.weight,
      variant.length,
      variant.width,
      variant.height,
      variant.barCode ?? null,
      variant.productImage.map(
        (img) =>
          new ProductImage(
            img.id,
            img.desktopImageUrl,
            img.desktopImageAlt,
            img.desktopImageFirst,
            img.mobileImageUrl,
            img.mobileImageAlt,
            img.mobileImageFirst, // você pode ajustar lógica aqui
          ),
      ),
      variant.productVariantAttributes.map(
        (attr) =>
          new ProductVariantAttributeValue(
            attr.id,
            new AttributeValueProduct(
              attr.attributeValue.id,
              attr.attributeValue.name,
              attr.attributeValue.value,
              new AttributeProduct(
                attr.attributeValue.attribute.id,
                attr.attributeValue.attribute.name,
              ),
            ),
          ),
      ),
      variant.stock ?? null,
      variant.seoTitle ?? null,
      variant.seoDescription ?? null,
      variant.seoKeywords ?? null,
      variant.seoCanonicalUrl ?? null,
      variant.seoMetaRobots ?? null,
    );
  }
}
