import { BaseRepository } from '@domain/common';
import {
  CreateProduct,
  CreateProductImage,
  CreateProductVariant,
  ListProduct,
  Product,
  ProductAdmin,
} from '../entities';

type CreateReturn = {
  id: string;
};

export abstract class ProductRepository extends BaseRepository<
  Product,
  CreateProduct,
  unknown,
  ListProduct,
  ProductAdmin,
  CreateReturn
> {
  abstract findBySlug(slug: string): Promise<Product>;
  abstract createImageVariant(dto: CreateProductImage): Promise<void>;
  abstract createVariant(dto: CreateProductVariant): Promise<CreateReturn>;
}
