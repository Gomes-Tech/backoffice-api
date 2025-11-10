import { CreateProductFAQUseCase } from '@app/product';
import {
  DeleteProductFAQUseCase,
  FindProductFAQByIdUseCase,
  FindProductFAQByProductIdUseCase,
  UpdateProductFAQUseCase,
} from '@app/product-faq';
import { PrismaProductFAQRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindProductFAQByIdUseCase,
    FindProductFAQByProductIdUseCase,
    CreateProductFAQUseCase,
    UpdateProductFAQUseCase,
    DeleteProductFAQUseCase,
    PrismaProductFAQRepository,
    {
      provide: 'ProductFAQRepository',
      useExisting: PrismaProductFAQRepository,
    },
  ],
  exports: [
    FindProductFAQByIdUseCase,
    FindProductFAQByProductIdUseCase,
    CreateProductFAQUseCase,
    UpdateProductFAQUseCase,
    DeleteProductFAQUseCase,
    PrismaProductFAQRepository,
    {
      provide: 'ProductFAQRepository',
      useExisting: PrismaProductFAQRepository,
    },
  ],
})
export class ProductFAQModule {}
