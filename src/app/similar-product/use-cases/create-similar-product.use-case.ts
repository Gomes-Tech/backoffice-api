import { SimilarProductRepository } from '@domain/similar-product';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateSimilarProductUseCase {
  constructor(
    @Inject('SimilarProductRepository')
    private readonly similarProductRepository: SimilarProductRepository,
  ) {}

  async execute(productId: string): Promise<string> {
    return await this.similarProductRepository.create({
      id: uuidv4(),
      productId,
    });
  }
}
