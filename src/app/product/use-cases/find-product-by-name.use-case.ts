import { ProductRepository } from '@domain/product/repositories';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProductByNameUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(name: string): Promise<{ name: string }> {
    const Product = await this.productRepository.findByName(name);

    if (!Product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return Product;
  }
}
