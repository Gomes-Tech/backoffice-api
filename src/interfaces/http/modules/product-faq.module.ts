import { CreateProductFAQUseCase } from '@app/product';
import {
  DeleteProductFAQUseCase,
  FindProductFAQByIdUseCase,
  UpdateProductFAQUseCase,
} from '@app/product-faq';
import { PrismaProductFAQRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FindProductFAQByIdUseCase,
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
