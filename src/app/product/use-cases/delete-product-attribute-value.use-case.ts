import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteProductAttributeValueUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    productVariantId: string,
    attributeValueId: string,
  ): Promise<void> {
    await this.productRepository.deleteAttributeValue(
      productVariantId,
      attributeValueId,
    );
  }
}
