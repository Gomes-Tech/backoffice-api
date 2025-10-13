import { BaseRepository } from '@domain/common';
import { CreateRelatedProduct, RelatedProductEntity } from '../entities';

export abstract class RelatedProductRepository extends BaseRepository<
  RelatedProductEntity,
  CreateRelatedProduct,
  unknown,
  RelatedProductEntity,
  RelatedProductEntity,
  string
> {}
