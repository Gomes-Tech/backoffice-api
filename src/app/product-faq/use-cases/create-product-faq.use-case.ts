import { CreateProductFAQ, ProductFAQRepository } from '@domain/product-faq';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateProductFAQUseCase {
  constructor(
    @Inject('ProductFAQRepository')
    private readonly productFAQRepository: ProductFAQRepository,
  ) {}

  async execute(dto: CreateProductFAQ): Promise<void> {
    return await this.productFAQRepository.create({
      ...dto,
      id: uuidv4(),
    });
  }
}
