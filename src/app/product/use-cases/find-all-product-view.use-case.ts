import { ListProductsToView, ProductRepository } from '@domain/product';
import { FindProductsFilterDto } from '@interfaces/http/dtos/product/find-all-query.dto';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllProductViewUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    filters?: FindProductsFilterDto,
  ): Promise<{ data: ListProductsToView[]; total: number }> {
    return await this.productRepository.findToView(filters);
  }
}
