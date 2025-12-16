import { ListProductAdmin, ProductRepository } from '@domain/product';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<ListProductAdmin[]> {
    return await this.productRepository.findAllAdmin();
  }
}
