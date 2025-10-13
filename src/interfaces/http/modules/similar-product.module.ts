import {
  CreateSimilarProductUseCase,
  DeleteSimilarProductUseCase,
  FindSimilarProductByIdUseCase,
} from '@app/similar-product';
import { PrismaSimilarProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindSimilarProductByIdUseCase,
    CreateSimilarProductUseCase,
    DeleteSimilarProductUseCase,
    PrismaSimilarProductRepository,
    {
      provide: 'SimilarProductRepository',
      useExisting: PrismaSimilarProductRepository,
    },
  ],
  exports: [
    FindSimilarProductByIdUseCase,
    CreateSimilarProductUseCase,
    DeleteSimilarProductUseCase,
    PrismaSimilarProductRepository,
    {
      provide: 'SimilarProductRepository',
      useExisting: PrismaSimilarProductRepository,
    },
  ],
})
export class SimilarProductModule {}
