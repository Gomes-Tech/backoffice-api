import { BaseRepository } from '@domain/common';
import {
  CreateProduct,
  CreateProductImage,
  CreateProductVariant,
  FindAllProductFilters,
  ListProduct,
  ListProductAdmin,
  ListProductsToView,
  Product,
  ProductAdmin,
  UpdateProduct,
} from '../entities';

type CreateReturn = {
  id: string;
};

export abstract class ProductRepository extends BaseRepository<
  Product,
  CreateProduct,
  UpdateProduct,
  ListProduct,
  ProductAdmin,
  CreateReturn
> {
  abstract findBySlug(slug: string): Promise<Product>;
  abstract findByName(name: string): Promise<{ name: string }>;
  abstract findVariants(productId: string): Promise<any[]>;
  abstract findToView(
    filters?: FindAllProductFilters,
  ): Promise<{ data: ListProductsToView[]; total: number }>;
  abstract findProductAttributes(productIds: string[]): Promise<
    {
      attributeName: string;
      values: { id: string; name: string; value: string }[];
    }[]
  >;
  abstract createImageVariant(dto: CreateProductImage): Promise<void>;
  abstract deleteImageVariant(productImageId: string): Promise<void>;
  abstract createVariant(dto: CreateProductVariant): Promise<CreateReturn>;
  abstract updateVariant(
    variantId: string,
    dto: Omit<CreateProductVariant, 'id' | 'productId'>,
  ): Promise<void>;
  abstract deleteVariant(variantId: string, userId: string): Promise<void>;
  abstract deleteAttributeValue(
    id: string,
    attributeValueId: string,
  ): Promise<void>;
  abstract deleteAttributeValuesVariant(
    productId: string,
    keepAtrtributes: string[],
    userId: string,
  ): Promise<void>;
  abstract findVariantsWithDetails(
    productId: string,
  ): Promise<
    Array<{
      id: string;
      price: number;
      sku: number;
      stock: number | null;
      weight: string;
      length: string;
      width: string;
      height: string;
      barCode: string | null;
      discountPix: string | null;
      discountPrice: string | null;
      isActive: boolean;
      seoTitle: string | null;
      seoDescription: string | null;
      seoKeywords: string | null;
      seoCanonicalUrl: string | null;
      seoMetaRobots: string | null;
      productVariantAttributes: Array<{ attributeValueId: string }>;
    }>
  >;
  abstract addAttributesToVariant(
    variantId: string,
    attributeValueIds: string[],
  ): Promise<void>;
  abstract findAllAdmin(): Promise<ListProductAdmin[]>;
}
