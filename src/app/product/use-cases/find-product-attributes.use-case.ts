import { ProductRepository } from '@domain/product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProductAttributesUseCase {
  constructor(
    @Inject('ProductRepository')
    private productRepository: ProductRepository,
  ) {}

  async execute(productIds: string[]) {
    return await this.productRepository.findProductAttributes(productIds);
  }
}
