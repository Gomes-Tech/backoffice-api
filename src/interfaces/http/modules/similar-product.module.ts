import {
  CreateSimilarProductUseCase,
  DeleteSimilarProductUseCase,
  FindSimilarProductByIdUseCase,
  FindSimilarProductsByProductIdUseCase,
} from '@app/similar-product';
import { PrismaSimilarProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindSimilarProductByIdUseCase,
    FindSimilarProductsByProductIdUseCase,
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
    FindSimilarProductsByProductIdUseCase,
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
