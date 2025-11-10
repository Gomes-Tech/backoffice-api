import { ProductAdmin } from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string): Promise<ProductAdmin> {
    const Product = await this.productRepository.findById(id);

    if (!Product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return Product;
  }
}
