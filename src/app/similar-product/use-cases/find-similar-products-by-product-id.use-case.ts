import {
  SimilarProductEntity,
  SimilarProductRepository,
} from '@domain/similar-product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindSimilarProductsByProductIdUseCase {
  constructor(
    @Inject('SimilarProductRepository')
    private readonly similarProductRepository: SimilarProductRepository,
  ) {}

  async execute(id: string): Promise<SimilarProductEntity[]> {
    const similarProduct =
      await this.similarProductRepository.findByProductId(id);

    if (!similarProduct) {
      return [];
    }

    return similarProduct;
  }
}
