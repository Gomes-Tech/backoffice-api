import { ProductFAQEntity, ProductFAQRepository } from '@domain/product-faq';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProductFAQByIdUseCase {
  constructor(
    @Inject('ProductFAQRepository')
    private readonly productFAQRepository: ProductFAQRepository,
  ) {}

  async execute(id: string): Promise<ProductFAQEntity> {
    const faq = await this.productFAQRepository.findById(id);

    if (!faq) {
      throw new NotFoundException('FAQ não encontrado');
    }

    return faq;
  }
}
