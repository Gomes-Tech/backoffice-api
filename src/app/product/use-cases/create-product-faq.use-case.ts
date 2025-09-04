import { CreateProductFAQ } from '@domain/product/entities';
import { ProductRepository } from '@domain/product/repositories';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateProductFAQUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: CreateProductFAQ): Promise<void> {
    return await this.productRepository.createProductFAQ({
      ...dto,
      id: uuidv4(),
    });
  }
}
