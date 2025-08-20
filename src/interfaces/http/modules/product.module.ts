import {
  CreateProductImageUseCase,
  CreateProductUseCase,
  CreateProductVariantUseCase,
  DeleteProductUseCase,
  FindProductByIdUseCase,
  FindProductBySlugUseCase,
} from '@app/product';
import { PrismaProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { ProductController } from '../controllers';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [
    FindProductByIdUseCase,
    FindProductBySlugUseCase,
    CreateProductImageUseCase,
    CreateProductUseCase,
    CreateProductVariantUseCase,
    DeleteProductUseCase,
    PrismaProductRepository,
    {
      provide: 'ProductRepository',
      useExisting: PrismaProductRepository,
    },
  ],
  exports: [],
})
export class ProductModule {}
