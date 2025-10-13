import { ProductFAQRepository } from '@domain/product-faq';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteProductFAQUseCase {
  constructor(
    @Inject('ProductFAQRepository')
    private readonly productFAQRepository: ProductFAQRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const faq = await this.productFAQRepository.findById(id);

    if (!faq) {
      throw new Error(`Esse FAQ não foi encontrado: ${id}`);
    }

    await this.productFAQRepository.delete(id, userId);
  }
}
