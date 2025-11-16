import { CreateProductVariant } from '@domain/product';
import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateProductVariantUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    id: string,
    dto: Omit<CreateProductVariant, 'id' | 'productId'>,
  ): Promise<void> {
    await this.productRepository.updateVariant(id, dto);
  }
}
