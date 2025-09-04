import { BaseRepository } from '@domain/common';
import {
  CreateProduct,
  CreateProductFAQ,
  CreateProductImage,
  CreateProductVariant,
  ListProduct,
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
  abstract createImageVariant(dto: CreateProductImage): Promise<void>;
  abstract createVariant(dto: CreateProductVariant): Promise<CreateReturn>;
  abstract createProductFAQ(dto: CreateProductFAQ): Promise<void>;
}
