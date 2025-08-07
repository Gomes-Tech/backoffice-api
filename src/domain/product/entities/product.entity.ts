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

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public isGreenSeal: string,
    public freeShipping: string,
    public immediateShipping: string,
    public isPersonalized: string,
    public isExclusive: string,
    public inCutout: string,
    public productVariants: ProductVariant[],
    public categories: string[],
    public description?: string,
  ) {}
}

class ProductVariant {
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

class ProductImage {
  constructor(
    public readonly id: string,
    public desktopImageUrl: string,
    public desktopImageAlt: string,
    public mobileImageUrl: string,
    public mobileImageAlt: string,
    public isFirst: boolean,
  ) {}
}

class ProductVariantAttributeValue {
  constructor(
    public readonly id: string,
    public attributeValue: AttributeValue[],
  ) {}
}

class AttributeValue {
  constructor(
    public readonly id: string,
    public name: string,
    public attribute: Attribute,
  ) {}
}

class Attribute {
  constructor(
    public readonly id: string,
    public name: string,
  ) {}
}
