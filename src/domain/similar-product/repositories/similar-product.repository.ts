import { BaseRepository } from '@domain/common';
import { CreateSimilarProduct, SimilarProductEntity } from '../entities';

export abstract class SimilarProductRepository extends BaseRepository<
  SimilarProductEntity,
  CreateSimilarProduct,
  unknown,
  SimilarProductEntity,
  SimilarProductEntity,
  string
> {
  abstract findByProductId(productId: string): Promise<SimilarProductEntity[]>;
}
