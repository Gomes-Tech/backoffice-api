import { RelatedProductRepository } from '@domain/related-product';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindRelatedProductByIdUseCase {
  constructor(
    @Inject('RelatedProductRepository')
    private readonly RelatedProductRepository: RelatedProductRepository,
  ) {}

  async execute(id: string): Promise<{ id: string }> {
    const relatedProduct = await this.RelatedProductRepository.findById(id);

    if (!relatedProduct) {
      throw new NotFoundException('Produto relacionado não encontrado');
    }

    return relatedProduct;
  }
}
