import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(productId: string, userId: string): Promise<void> {
    await this.productRepository.findById(productId);

    await this.productRepository.delete(productId, userId);
  }
}
