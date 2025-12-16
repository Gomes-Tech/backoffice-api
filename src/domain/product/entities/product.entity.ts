import { CreateProductFAQ, ProductFAQEntity } from '@domain/product-faq';

export class ListProduct {
  constructor(
    public readonly id: string,
    public name: string,
    public variants: ListProductVariant[],
  ) {}
}

class ListProductVariant {
  constructor(
    public readonly id: string,
    public price: number,
    public attributeValue: string[],
    public stock?: number,
  ) {}
}

export class ListProductAdminVariant {
  constructor(
    public readonly id: string,
    public price: number,
    public discountPrice: string | null,
    public discountPix: string | null,
    public stock: number | null,
    public attributes: string[],
    public imageUrl?: string,
  ) {}
}

export class ListProductAdmin {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public tags: string[],
    public variants: ListProductAdminVariant[],
    public flags: {
      isExclusive: boolean;
      isPersonalized: boolean;
      freeShipping: boolean;
      immediateShipping: boolean;
      isGreenSeal: boolean;
      inCutout: boolean;
    },
    public salesCount: number,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: string,
    public imageUrl?: string,
  ) {}
}

export class ListProductsToView {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public freeShipping: boolean,
    public immediateShipping: boolean,
    public isPersonalized: boolean,
    public isExclusive: boolean,
    public productVariant: {
      id: string;
      price: number;
      sku: number;
      discountPrice: string;
      discountPix: string;
      stock?: number;
      productImage: {
        desktopImageUrl: string;
        desktopImageAlt: string;
      };
    },
  ) {}
}

export class FindAllProductFilters {
  constructor(
    public name?: string,
    public categories?: string[],
    public minPrice?: number,
    public maxPrice?: number,
    public sku?: string,
    public attributeValueIds?: string[],
    public take?: number,
    public skip?: number,
    public orderBy?: 'minPrice' | 'maxPrice' | 'bestSellers',
  ) {}
}

export class ProductAdmin {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isGreenSeal: boolean,
    public freeShipping: boolean,
    public immediateShipping: boolean,
    public isPersonalized: boolean,
    public isExclusive: boolean,
    public inCutout: boolean,
    public categories: string[],
    public productVariants: ProductVariantAdmin[],
    public description?: string,
    public technicalInfo?: string,
    public videoLink?: string,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
    public relatedProducts?: string[],
    public similarProducts?: string[],
    public productFAQs?: ProductFAQEntity[],
  ) {}
}

export class ProductVariantAdmin {
  constructor(
    public readonly id: string,
    public price: number,
    public sku: number,
    public isActive: boolean,
    public discountPrice: string,
    public discountPix: string,
    public weight: string,
    public length: string,
    public width: string,
    public height: string,
    public barCode: string,
    public createdAt: Date,
    public images: {
      id: string;
      desktopImageUrl: string;
      desktopImageKey: string;
      mobileImageUrl: string;
      mobileImageKey: string;
      mobileImageFirst: boolean;
      desktopImageFirst: boolean;
    }[],
    public productVariantAttributes: string[],
    public stock?: number,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
  ) {}
}

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isGreenSeal: boolean,
    public freeShipping: boolean,
    public immediateShipping: boolean,
    public isPersonalized: boolean,
    public isExclusive: boolean,
    public inCutout: boolean,
    public productVariants: ProductVariant[],
    public categories: {
      id: string;
      name: string;
      slug: string;
    }[],
    public description?: string,
    public technicalInfo?: string,
    public videoLink?: string,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
    public productFAQ?: ProductFAQEntity[],
  ) {}
}

export class ProductVariant {
  constructor(
    public readonly id: string,
    public price: number,
    public sku: number,
    public isActive: boolean,
    public discountPrice: string,
    public discountPix: string,
    public weight: string,
    public length: string,
    public width: string,
    public height: string,
    public barCode: string,
    public images: ProductImage[],
    public productVariantAttributes: ProductVariantAttributeValue[],
    public stock?: number,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
  ) {}
}

export class ProductImage {
  constructor(
    public readonly id: string,
    public desktopImageUrl: string,
    public desktopImageAlt: string,
    public desktopImageFirst: boolean,
    public mobileImageUrl: string,
    public mobileImageAlt: string,
    public mobileImageFirst: boolean,
  ) {}
}

export class ProductVariantAttributeValue {
  constructor(
    public readonly id: string,
    public attributeValue: AttributeValueProduct,
  ) {}
}

export class AttributeValueProduct {
  constructor(
    public readonly id: string,
    public name: string,
    public value: string,
    public attribute: AttributeProduct,
  ) {}
}

export class AttributeProduct {
  constructor(
    public readonly id: string,
    public name: string,
  ) {}
}

export class CreateProduct {
  constructor(
    public id: string,
    public name: string,
    public slug: string,
    public isGreenSeal: boolean,
    public freeShipping: boolean,
    public immediateShipping: boolean,
    public isPersonalized: boolean,
    public isExclusive: boolean,
    public inCutout: boolean,
    public categories: string[],
    public description?: string,
    public technicalInfo?: string,
    public videoLink?: string,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
    public productFAQ?: CreateProductFAQ[],
    public relatedProducts?: string[],
    public similarProducts?: string[],
  ) {}
}

export class CreateProductVariant {
  constructor(
    public id: string,
    public price: number,
    public isActive: boolean,
    public weight: string,
    public length: string,
    public width: string,
    public height: string,
    public productId: string,
    public productVariantAttributes: string[],
    public discountPrice?: string,
    public discountPix?: string,
    public barCode?: string,
    public sku?: number,
    public stock?: number,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
  ) {}
}

export class CreateProductImage {
  constructor(
    public id: string,
    public productVariant: string,
    public desktopImageUrl: string,
    public desktopImageAlt: string,
    public desktopImageKey: string,
    public mobileImageUrl: string,
    public mobileImageAlt: string,
    public mobileImageKey: string,
    public mobileImageFirst: boolean,
    public desktopImageFirst: boolean,
  ) {}
}

export class UpdateProduct {
  constructor(
    public name?: string,
    public slug?: string,
    public isGreenSeal?: boolean,
    public freeShipping?: boolean,
    public immediateShipping?: boolean,
    public isPersonalized?: boolean,
    public isExclusive?: boolean,
    public inCutout?: boolean,
    public categories?: string[],
    public description?: string,
    public technicalInfo?: string,
    public videoLink?: string,
    public seoTitle?: string,
    public seoDescription?: string,
    public seoKeywords?: string,
    public seoCanonicalUrl?: string,
    public seoMetaRobots?: string,
    public productFAQ?: CreateProductFAQ[],
    public relatedProducts?: string[],
    public similarProducts?: string[],
  ) {}
}
