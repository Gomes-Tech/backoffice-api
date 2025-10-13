import { ProductFAQRepository, UpdateProductFAQ } from '@domain/product-faq';
import { Inject, Injectable } from '@nestjs/common';
import { FindProductFAQByIdUseCase } from './find-product-faq-by-id.use-case';

@Injectable()
export class UpdateProductFAQUseCase {
  constructor(
    @Inject('ProductFAQRepository')
    private readonly productFAQRepository: ProductFAQRepository,
    private readonly findProductFAQByIdUseCase: FindProductFAQByIdUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductFAQ,
    userId: string,
  ): Promise<void> {
    await this.findProductFAQByIdUseCase.execute(id);

    await this.productFAQRepository.update(
      id,
      {
        ...dto,
      },
      '',
    );
  }
}
