import { RelatedProductRepository } from '@domain/related-product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteRelatedProductUseCase {
  constructor(
    @Inject('RelatedProductRepository')
    private readonly relatedProductRepository: RelatedProductRepository,
  ) {}

  async execute(relatedProductId: string, userId: string): Promise<void> {
    await this.relatedProductRepository.findById(relatedProductId);

    await this.relatedProductRepository.delete(relatedProductId, userId);
  }
}
