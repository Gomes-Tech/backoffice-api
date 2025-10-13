import { BaseRepository } from '@domain/common';
import {
  CreateProductFAQ,
  ProductFAQEntity,
  UpdateProductFAQ,
} from '../entities';

export abstract class ProductFAQRepository extends BaseRepository<
  ProductFAQEntity,
  CreateProductFAQ,
  UpdateProductFAQ
> {}
