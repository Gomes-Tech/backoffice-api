import { SimilarProductRepository } from '@domain/similar-product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteSimilarProductUseCase {
  constructor(
    @Inject('SimilarProductRepository')
    private readonly similarProductRepository: SimilarProductRepository,
  ) {}

  async execute(similarProductId: string, userId: string): Promise<void> {
    await this.similarProductRepository.findById(similarProductId);

    await this.similarProductRepository.delete(similarProductId, userId);
  }
}
