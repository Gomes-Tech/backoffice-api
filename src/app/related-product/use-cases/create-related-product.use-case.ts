import { RelatedProductRepository } from '@domain/related-product';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateRelatedProductUseCase {
  constructor(
    @Inject('RelatedProductRepository')
    private readonly relatedProductRepository: RelatedProductRepository,
  ) {}

  async execute(productId: string): Promise<string> {
    return await this.relatedProductRepository.create({
      id: uuidv4(),
      productId,
    });
  }
}
