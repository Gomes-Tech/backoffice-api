import { ProductRepository } from '@domain/product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(productImageId: string) {
    await this.productRepository.deleteImageVariant(productImageId);
  }
}
