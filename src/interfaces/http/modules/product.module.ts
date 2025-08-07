import { DeleteProductUseCase } from '@app/product';
import { PrismaProductRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { ProductController } from '../controllers';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [
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
