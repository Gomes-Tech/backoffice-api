import {
  CreateProductFAQUseCase,
  CreateProductImageUseCase,
  CreateProductUseCase,
  CreateProductVariantUseCase,
  DeleteProductUseCase,
  FindAllProductViewUseCase,
  FindProductByIdUseCase,
  FindProductBySlugUseCase,
} from '@app/product';
import { PrismaProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { ProductController } from '../controllers';
import { AttributeValueModule } from './attribute-value.module';

@Module({
  imports: [AttributeValueModule],
  controllers: [ProductController],
  providers: [
    FindAllProductViewUseCase,
    FindProductByIdUseCase,
    FindProductBySlugUseCase,
    CreateProductImageUseCase,
    CreateProductFAQUseCase,
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
