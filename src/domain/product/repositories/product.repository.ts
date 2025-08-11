import { BaseRepository } from '@domain/common';
import {
  CreateProduct,
  CreateProductImage,
  CreateProductVariant,
  ListProduct,
  Product,
} from '../entities';

type CreateReturn = {
  id: string;
};

export abstract class ProductRepository extends BaseRepository<
  Product,
  CreateProduct,
  unknown,
  ListProduct,
  Product,
  CreateReturn
> {
  abstract createImageVariant(dto: CreateProductImage): Promise<void>;
  abstract createVariant(dto: CreateProductVariant): Promise<CreateReturn>;
}
