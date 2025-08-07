import { BaseRepository } from '@domain/common';
import { ListProduct, Product } from '../entities';

export abstract class ProductRepository extends BaseRepository<
  Product,
  unknown,
  unknown,
  ListProduct
> {}
