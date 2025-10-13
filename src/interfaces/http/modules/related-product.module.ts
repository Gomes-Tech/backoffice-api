import {
  CreateRelatedProductUseCase,
  DeleteRelatedProductUseCase,
  FindRelatedProductByIdUseCase,
} from '@app/related-product';
import { PrismaRelatedProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindRelatedProductByIdUseCase,
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
