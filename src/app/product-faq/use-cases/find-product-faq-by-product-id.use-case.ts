import { ProductFAQEntity, ProductFAQRepository } from '@domain/product-faq';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProductFAQByProductIdUseCase {
  constructor(
    @Inject('ProductFAQRepository')
    private readonly productFAQRepository: ProductFAQRepository,
  ) {}

  async execute(productId: string): Promise<ProductFAQEntity[]> {
    const faqs =
      await this.productFAQRepository.findProductFAQByProductId(productId);

    if (!faqs) {
      return [];
    }

    return faqs;
  }
}
