import {
  CreateProductFAQUseCase,
  CreateProductImageUseCase,
  CreateProductUseCase,
  CreateProductVariantUseCase,
  DeleteProductUseCase,
  FindAllProductViewUseCase,
  FindProductAttributesUseCase,
  FindProductByIdUseCase,
  FindProductByNameUseCase,
  FindProductBySlugUseCase,
} from '@app/product';
import { PrismaProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { ProductController } from '../controllers';
import { AttributeValueModule } from './attribute-value.module';
import { ProductFAQModule } from './product-faq.module';
import { RelatedProductModule } from './related-product.module';
import { SimilarProductModule } from './similar-product.module';

@Module({
  imports: [
    AttributeValueModule,
    RelatedProductModule,
    SimilarProductModule,
    ProductFAQModule,
  ],
  controllers: [ProductController],
  providers: [
    FindAllProductViewUseCase,
    FindProductAttributesUseCase,
    FindProductByIdUseCase,
    FindProductByNameUseCase,
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
