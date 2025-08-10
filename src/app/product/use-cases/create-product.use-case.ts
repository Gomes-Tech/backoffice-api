import { ProductRepository } from '@domain/product/repositories';
import { StorageService } from '@infra/providers';
import { CreateProductDTO } from '@interfaces/http';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateProductDTO,
    files: {
      desktop: Express.Multer.File[];
      mobile: Express.Multer.File[];
    },
  ): Promise<void> {
    const desktopImages = await Promise.allSettled(
      files.desktop.map((file) =>
        this.storageService.uploadFile(
          'products/desktop',
          file.filename,
          file.buffer,
        ),
      ),
    );

    const mobileImages = await Promise.allSettled(
      files.mobile.map((file) =>
        this.storageService.uploadFile(
          'products/mobile',
          file.filename,
          file.buffer,
        ),
      ),
    );
  }
}
