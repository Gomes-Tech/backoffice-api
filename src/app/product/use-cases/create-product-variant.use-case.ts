import { CreateProductVariant } from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateProductVariantUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: CreateProductVariant): Promise<{ id: string }> {
    return await this.productRepository.createVariant(dto);
  }
}
