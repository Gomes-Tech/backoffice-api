import { FindAttributeValueByIdWithAttributeUseCase } from '@app/attribute-value';
import { ProductRepository } from '@domain/product/repositories';
import { StorageFile, StorageService } from '@infra/providers';
import { CreateProductDTO } from '@interfaces/http';
import { ProductFile } from '@interfaces/http/controllers';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductFAQUseCase } from './create-product-faq.use-case';
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
    private readonly findAttributeValueByIdWithAttributeUseCase: FindAttributeValueByIdWithAttributeUseCase,
    private readonly createProductFAQUseCase: CreateProductFAQUseCase,
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

    for (const faq of dto.productFAQ) {
      await this.createProductFAQUseCase
        .execute({
          ...faq,
          id: '',
          productId: productId,
        })
        .catch(() => null);
    }

    const mainVariant = dto.productVariants[0];

    let createdVariantIds: string[] = [];

    if (
      mainVariant.productVariantAttributes &&
      mainVariant.productVariantAttributes.length > 0
    ) {
      // Se houver atributos -> gerar combinações
      const attributeResults = await Promise.allSettled(
        mainVariant.productVariantAttributes.map(async (valueId) => {
          const value =
            await this.findAttributeValueByIdWithAttributeUseCase.execute(
              valueId,
            );
          return { id: value.id, attributeId: value.attributeId };
        }),
      );

      const attributeValues = attributeResults
        .filter(
          (
            res,
          ): res is PromiseFulfilledResult<{
            id: string;
            attributeId: string;
          }> => res.status === 'fulfilled',
        )
        .map((res) => res.value);

      // Agrupa por attributeId
      const grouped: Record<string, string[]> = {};
      for (const val of attributeValues) {
        if (!grouped[val.attributeId]) grouped[val.attributeId] = [];
        grouped[val.attributeId].push(val.id);
      }

      // Gera combinações
      const combinations = this.cartesian(Object.values(grouped));

      let addMore = 0;

      for (const combo of combinations) {
        const variant = await this.createProductVariantUseCase.execute({
          id: uuidv4(),
          productId,
          barCode: mainVariant.barCode,
          discountPix: mainVariant.discountPix,
          discountPrice: mainVariant.discountPrice,
          height: mainVariant.height,
          isActive: mainVariant.isActive,
          length: mainVariant.length,
          price: mainVariant.price,
          sku: mainVariant.sku + addMore,
          weight: mainVariant.weight,
          width: mainVariant.width,
          productVariantAttributes: combo,
          seoCanonicalUrl: mainVariant.seoCanonicalUrl,
          seoDescription: mainVariant.seoDescription,
          seoKeywords: mainVariant.seoKeywords,
          seoMetaRobots: mainVariant.seoMetaRobots,
          seoTitle: mainVariant.seoTitle,
          stock: mainVariant.stock,
        });
        createdVariantIds.push(variant.id);

        addMore++;
      }
    } else {
      // Se não houver atributos -> cria só 1 variação
      const variant = await this.createProductVariantUseCase.execute({
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
        productVariantAttributes: [],
        seoCanonicalUrl: mainVariant.seoCanonicalUrl,
        seoDescription: mainVariant.seoDescription,
        seoKeywords: mainVariant.seoKeywords,
        seoMetaRobots: mainVariant.seoMetaRobots,
        seoTitle: mainVariant.seoTitle,
        stock: mainVariant.stock,
      });
      createdVariantIds.push(variant.id);
    }

    // Agora createdVariantIds[0] é a "main variant" para imagens
    const mainVariantId = createdVariantIds[0];

    // Só cria imagens se houver arquivos
    if (files?.desktopImages?.length && files?.mobileImages?.length) {
      const desktopResults = await Promise.allSettled(
        files.desktopImages.map((file, index) =>
          this.storageService
            .uploadFile('products/desktop', file.originalname, file.buffer)
            .then((storageFile) => ({
              ...storageFile,
              isFirst: dto.desktopImageFirst === String(index),
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
        desktopImageKey: desktopUrls[i].path,
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
            productVariant: mainVariantId, // agora vincula à primeira variação criada
          });
        } catch (error) {
          continue;
        }
      }
    }
  }

  private cartesian(arrays: string[][]): string[][] {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]],
    );
  }
}
