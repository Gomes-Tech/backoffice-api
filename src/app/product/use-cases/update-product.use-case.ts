import { ProductRepository } from '@domain/product';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateProductUseCase {
  // Implementation of the use case will go here
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {}
}
