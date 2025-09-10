import { BaseRepository } from '@domain/common';
import {
  CreateProduct,
  CreateProductFAQ,
  CreateProductImage,
  CreateProductVariant,
  FindAllProductFilters,
  ListProduct,
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
  abstract findToView(
    filters?: FindAllProductFilters,
  ): Promise<{ data: ListProductsToView[]; total: number }>;
  abstract createImageVariant(dto: CreateProductImage): Promise<void>;
  abstract createVariant(dto: CreateProductVariant): Promise<CreateReturn>;
  abstract createProductFAQ(dto: CreateProductFAQ): Promise<void>;
  abstract updateVariant(
    variantId: string,
    dto: Omit<CreateProductVariant, 'id' | 'productId'>,
  ): Promise<void>;
  abstract deleteVariant(variantId: string, userId: string): Promise<void>;
}
