import { SimilarProductRepository } from '@domain/similar-product';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindSimilarProductByIdUseCase {
  constructor(
    @Inject('SimilarProductRepository')
    private readonly similarProductRepository: SimilarProductRepository,
  ) {}

  async execute(id: string): Promise<{ id: string }> {
    const similarProduct = await this.similarProductRepository.findById(id);

    if (!similarProduct) {
      throw new NotFoundException('Produto similar não encontrado');
    }

    return similarProduct;
  }
}
