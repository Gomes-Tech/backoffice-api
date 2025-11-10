import {
  RelatedProductEntity,
  RelatedProductRepository,
} from '@domain/related-product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindRelatedProductsByProductIdUseCase {
  constructor(
    @Inject('RelatedProductRepository')
    private readonly RelatedProductRepository: RelatedProductRepository,
  ) {}

  async execute(id: string): Promise<RelatedProductEntity[]> {
    const relatedProduct =
      await this.RelatedProductRepository.findByProductId(id);

    if (!relatedProduct) {
      return [];
    }

    return relatedProduct;
  }
}
