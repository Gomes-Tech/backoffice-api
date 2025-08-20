import { Product } from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProductBySlugUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(slug: string): Promise<Product> {
    const Product = await this.productRepository.findBySlug(slug);

    if (!Product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return Product;
  }
}
