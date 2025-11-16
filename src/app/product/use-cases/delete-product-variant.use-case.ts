import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteProductVariantUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.productRepository.deleteVariant(id, userId);
  }
}
