import { ProductRepository } from '@domain/product/repositories';
import { StorageFile, StorageService } from '@infra/providers';
import { CreateProductDTO } from '@interfaces/http';
import { ProductFile } from '@interfaces/http/controllers';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductImageUseCase } from './create-product-image.use-case';
import { CreateProductVariantUseCase } from './create-product-variant.use-case';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    private readonly storageService: StorageService,
    private readonly createProductImageUseCase: CreateProductImageUseCase,
    private readonly createProductVariantUseCase: CreateProductVariantUseCase,
  ) {}

  async execute(
    dto: CreateProductDTO,
    userId: string,
    files?: {
      desktopImages?: ProductFile[];
      mobileImages?: ProductFile[];
    },
  ): Promise<void> {
    const { id: productId } = await this.productRepository.create(
      {
        id: uuidv4(),
        name: dto.name,
        slug: dto.slug,
        categories: dto.categories,
        description: dto.description,
        technicalInfo: dto.technicalInfo,
        isGreenSeal: dto.isGreenSeal,
        freeShipping: dto.freeShipping,
        immediateShipping: dto.immediateShipping,
        isPersonalized: dto.isPersonalized,
        isExclusive: dto.isExclusive,
        inCutout: dto.inCutout,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoCanonicalUrl: dto.seoCanonicalUrl,
        seoKeywords: dto.seoKeywords,
        seoMetaRobots: dto.seoMetaRobots,
        videoLink: dto.videoLink,
      },
      userId,
    );

    const mainVariant = dto.productVariants[0];

    const { id: variantId } = await this.createProductVariantUseCase.execute({
      id: uuidv4(),
      productId,
      barCode: mainVariant.barCode,
      discountPix: mainVariant.discountPix,
      discountPrice: mainVariant.discountPrice,
      height: mainVariant.height,
      isActive: mainVariant.isActive,
      length: mainVariant.length,
      price: mainVariant.price,
      sku: mainVariant.sku,
      weight: mainVariant.weight,
      width: mainVariant.width,
      productVariantAttributes: mainVariant.productVariantAttributes,
      seoCanonicalUrl: mainVariant.seoCanonicalUrl,
      seoDescription: mainVariant.seoDescription,
      seoKeywords: mainVariant.seoKeywords,
      seoMetaRobots: mainVariant.seoMetaRobots,
      seoTitle: mainVariant.seoTitle,
      stock: mainVariant.stock,
    });

    if (
      files.desktopImages &&
      files.desktopImages.length > 0 &&
      files.mobileImages &&
      files.mobileImages.length > 0
    ) {
      const desktopResults = await Promise.allSettled(
        files.desktopImages.map((file, index) =>
          this.storageService
            .uploadFile('products/desktop', file.originalname, file.buffer)
            .then((storageFile) => ({
              ...storageFile,
              isFirst: dto.desktopImageFirst === String(index), // preserva a flag
              alt: dto.name,
            })),
        ),
      );

      const mobileResults = await Promise.allSettled(
        files.mobileImages.map((file, index) =>
          this.storageService
            .uploadFile('products/mobile', file.originalname, file.buffer)
            .then((storageFile) => ({
              ...storageFile,
              isFirst: dto.mobileImageFirst === String(index),
              alt: dto.name,
            })),
        ),
      );

      const desktopUrls = desktopResults
        .filter(
          (
            res,
          ): res is PromiseFulfilledResult<
            StorageFile & { isFirst: boolean; alt: string }
          > => res.status === 'fulfilled',
        )
        .map((res) => res.value);

      const mobileUrls = mobileResults
        .filter(
          (
            res,
          ): res is PromiseFulfilledResult<
            StorageFile & { isFirst: boolean; alt: string }
          > => res.status === 'fulfilled',
        )
        .map((res) => res.value);

      const maxLength = Math.max(desktopUrls.length, mobileUrls.length);

      const images = Array.from({ length: maxLength }, (_, i) => ({
        desktopImageUrl: desktopUrls[i].publicUrl,
        desktopImageAlt: desktopUrls[i].alt,
        desktopImageKey: mobileUrls[i].path,
        mobileImageUrl: mobileUrls[i].publicUrl,
        mobileImageKey: mobileUrls[i].path,
        mobileImageAlt: mobileUrls[i].alt,
        desktopImageFirst: desktopUrls[i].isFirst,
        mobileImageFirst: mobileUrls[i].isFirst,
      }));

      for (const image of images) {
        try {
          await this.createProductImageUseCase.execute({
            id: uuidv4(),
            ...image,
            productVariant: variantId,
          });
        } catch (error) {
          continue;
        }
      }
    }
  }
}
