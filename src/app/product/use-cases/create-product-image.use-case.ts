import { CreateProductImage } from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateProductImageUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: CreateProductImage): Promise<void> {
    return await this.productRepository.createImageVariant(dto);
  }
}
