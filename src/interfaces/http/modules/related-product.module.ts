import {
  CreateRelatedProductUseCase,
  DeleteRelatedProductUseCase,
  FindRelatedProductByIdUseCase,
  FindRelatedProductsByProductIdUseCase,
} from '@app/related-product';
import { PrismaRelatedProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindRelatedProductByIdUseCase,
    FindRelatedProductsByProductIdUseCase,
    CreateRelatedProductUseCase,
    DeleteRelatedProductUseCase,
    PrismaRelatedProductRepository,
    {
      provide: 'RelatedProductRepository',
      useExisting: PrismaRelatedProductRepository,
    },
  ],
  exports: [
    FindRelatedProductByIdUseCase,
    FindRelatedProductsByProductIdUseCase,
    CreateRelatedProductUseCase,
    DeleteRelatedProductUseCase,
    PrismaRelatedProductRepository,
    {
      provide: 'RelatedProductRepository',
      useExisting: PrismaRelatedProductRepository,
    },
  ],
})
export class RelatedProductModule {}
