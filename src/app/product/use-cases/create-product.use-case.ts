import { FindAttributeValueByIdWithAttributeUseCase } from '@app/attribute-value';
import { ProductRepository } from '@domain/product/repositories';
import { BadRequestException } from '@infra/filters';
import { PrismaService } from '@infra/prisma';
import { StorageFile, StorageService } from '@infra/providers';
import { CreateProductDTO } from '@interfaces/http';
import { ProductFile } from '@interfaces/http/controllers';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FindProductByNameUseCase } from './find-product-by-name.use-case';
import { FindProductBySlugUseCase } from './find-product-by-slug.use-case';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
    private readonly findProductBySlugUseCase: FindProductBySlugUseCase,
    private readonly findProductByNameUseCase: FindProductByNameUseCase,
    private readonly findAttributeValueByIdWithAttributeUseCase: FindAttributeValueByIdWithAttributeUseCase,
  ) {}

  async execute(
    dto: CreateProductDTO,
    userId: string,
    files?: {
      desktopImages?: ProductFile[];
      mobileImages?: ProductFile[];
    },
  ): Promise<void> {
    // Validações antes da transação (operações de leitura)
    const existingSlug = await this.findProductBySlugUseCase
      .execute(dto.slug)
      .catch(() => null);

    if (existingSlug) {
      throw new BadRequestException('Esse slug já está em uso');
    }

    const existingName = await this.findProductByNameUseCase
      .execute(dto.name)
      .catch(() => null);

    if (existingName) {
      throw new BadRequestException('Esse nome já está em uso');
    }

    // Preparar uploads de arquivos antes da transação (operações externas)
    let desktopUrls: (StorageFile & { isFirst: boolean; alt: string })[] = [];
    let mobileUrls: (StorageFile & { isFirst: boolean; alt: string })[] = [];

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

      desktopUrls = desktopResults
        .filter(
          (
            res,
          ): res is PromiseFulfilledResult<
            StorageFile & { isFirst: boolean; alt: string }
          > => res.status === 'fulfilled',
        )
        .map((res) => res.value);

      mobileUrls = mobileResults
        .filter(
          (
            res,
          ): res is PromiseFulfilledResult<
            StorageFile & { isFirst: boolean; alt: string }
          > => res.status === 'fulfilled',
        )
        .map((res) => res.value);
    }

    // Preparar dados de atributos antes da transação (operações de leitura)
    const mainVariant = dto.productVariants[0];
    let attributeValues: { id: string; attributeId: string }[] = [];
    let combinations: string[][] = [];

    if (
      mainVariant.productVariantAttributes &&
      mainVariant.productVariantAttributes.length > 0
    ) {
      const attributeResults = await Promise.allSettled(
        mainVariant.productVariantAttributes.map(async (valueId) => {
          const value =
            await this.findAttributeValueByIdWithAttributeUseCase.execute(
              valueId,
            );
          return { id: value.id, attributeId: value.attributeId };
        }),
      );

      attributeValues = attributeResults
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
      combinations = this.cartesian(Object.values(grouped));
    }

    // Executar todas as operações de escrita dentro de uma transação
    await this.prismaService.$transaction(
      async (tx) => {
        const productId = uuidv4();

        // 1. Criar produto
        await tx.product.create({
          data: {
            id: productId,
            name: dto.name,
            slug: dto.slug,
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
            createdBy: { connect: { id: userId } },
            categories: {
              connect: dto.categories?.map((catId) => ({ id: catId })) || [],
            },
          },
        });

        // 2. Criar FAQs do produto
        if (dto.productFAQ && dto.productFAQ.length > 0) {
          await Promise.all(
            dto.productFAQ.map((faq) =>
              tx.productFAQ.create({
                data: {
                  id: uuidv4(),
                  question: faq.question,
                  answer: faq.answer,
                  Product: { connect: { id: productId } },
                },
              }),
            ),
          );
        }

        // 3. Criar variantes do produto
        let createdVariantIds: string[] = [];

        if (combinations.length > 0) {
          // Se houver atributos -> gerar combinações
          let addMore = 0;

          for (const combo of combinations) {
            const variantId = uuidv4();
            await tx.productVariant.create({
              data: {
                id: variantId,
                barCode: mainVariant.barCode,
                discountPix: mainVariant.discountPix,
                price: mainVariant.price,
                stock: mainVariant.stock,
                sku: mainVariant.sku + addMore,
                discountPrice: mainVariant.discountPrice,
                height: mainVariant.height,
                length: mainVariant.length,
                weight: mainVariant.weight,
                width: mainVariant.width,
                isActive: mainVariant.isActive,
                seoCanonicalUrl: mainVariant.seoCanonicalUrl,
                seoTitle: mainVariant.seoTitle,
                seoKeywords: mainVariant.seoKeywords,
                seoDescription: mainVariant.seoDescription,
                seoMetaRobots: mainVariant.seoMetaRobots,
                product: { connect: { id: productId } },
                productVariantAttributes: {
                  createMany: {
                    data: combo.map((attributeValueId) => ({
                      id: uuidv4(),
                      attributeValueId,
                    })),
                  },
                },
              },
            });
            createdVariantIds.push(variantId);
            addMore++;
          }
        } else {
          // Se não houver atributos -> cria só 1 variação
          const variantId = uuidv4();
          await tx.productVariant.create({
            data: {
              id: variantId,
              barCode: mainVariant.barCode,
              discountPix: mainVariant.discountPix,
              price: mainVariant.price,
              stock: mainVariant.stock,
              sku: mainVariant.sku,
              discountPrice: mainVariant.discountPrice,
              height: mainVariant.height,
              length: mainVariant.length,
              weight: mainVariant.weight,
              width: mainVariant.width,
              isActive: mainVariant.isActive,
              seoCanonicalUrl: mainVariant.seoCanonicalUrl,
              seoTitle: mainVariant.seoTitle,
              seoKeywords: mainVariant.seoKeywords,
              seoDescription: mainVariant.seoDescription,
              seoMetaRobots: mainVariant.seoMetaRobots,
              product: { connect: { id: productId } },
            },
          });
          createdVariantIds.push(variantId);
        }

        // 4. Criar imagens do produto (vinculadas à primeira variante)
        const mainVariantId = createdVariantIds[0];

        if (desktopUrls.length > 0 && mobileUrls.length > 0) {
          const maxLength = Math.max(desktopUrls.length, mobileUrls.length);

          const images = Array.from({ length: maxLength }, (_, i) => ({
            id: uuidv4(),
            desktopImageUrl: desktopUrls[i]?.publicUrl || '',
            desktopImageAlt: desktopUrls[i]?.alt || dto.name,
            desktopImageKey: desktopUrls[i]?.path || '',
            mobileImageUrl: mobileUrls[i]?.publicUrl || '',
            mobileImageKey: mobileUrls[i]?.path || '',
            mobileImageAlt: mobileUrls[i]?.alt || dto.name,
            desktopImageFirst: desktopUrls[i]?.isFirst || false,
            mobileImageFirst: mobileUrls[i]?.isFirst || false,
            variant: { connect: { id: mainVariantId } },
          }));

          await Promise.all(
            images.map((image) =>
              tx.productImage.create({
                data: image,
              }),
            ),
          );
        }

        // 5. Criar produtos relacionados
        // Nota: O schema atual de RelatedProduct só tem productId.
        // Assumindo que relatedProducts são IDs de produtos relacionados
        // e que cada um cria um RelatedProduct vinculado ao produto atual
        if (dto.relatedProducts && dto.relatedProducts.length > 0) {
          await Promise.all(
            dto.relatedProducts.map((relatedProductId) =>
              tx.relatedProduct.create({
                data: {
                  id: uuidv4(),
                  product: { connect: { id: productId } },
                },
              }),
            ),
          );
        }

        // 6. Criar produtos similares
        // Nota: Similar ao RelatedProduct, o schema só tem productId
        if (dto.similarProducts && dto.similarProducts.length > 0) {
          await Promise.all(
            dto.similarProducts.map((similarProductId) =>
              tx.similarProduct.create({
                data: {
                  id: uuidv4(),
                  product: { connect: { id: productId } },
                },
              }),
            ),
          );
        }
      },
      {
        maxWait: 10000, // Tempo máximo de espera para iniciar a transação (10s)
        timeout: 30000, // Timeout da transação (30s)
      },
    );
  }

  private cartesian(arrays: string[][]): string[][] {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]],
    );
  }
}
