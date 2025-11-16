import { FindAttributeValueByIdWithAttributeUseCase } from '@app/attribute-value';
import {
  CreateProductFAQUseCase,
  DeleteProductFAQUseCase,
  UpdateProductFAQUseCase,
} from '@app/product-faq';
import {
  CreateRelatedProductUseCase,
  DeleteRelatedProductUseCase,
} from '@app/related-product';
import {
  CreateSimilarProductUseCase,
  DeleteSimilarProductUseCase,
} from '@app/similar-product';
import { ProductRepository } from '@domain/product';
import { BadRequestException } from '@infra/filters';
import { StorageService } from '@infra/providers';
import { UpdateProductDTO } from '@interfaces/http';
import { ProductFile } from '@interfaces/http/controllers';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductVariantUseCase } from './create-product-variant.use-case';
import { FindProductByIdUseCase } from './find-product-by-id.use-case';
import { FindProductByNameUseCase } from './find-product-by-name.use-case';
import { FindProductBySlugUseCase } from './find-product-by-slug.use-case';
import { UpdateProductVariantUseCase } from './update-product-variant.use-case';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    private readonly storageService: StorageService,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly findProductBySlugUseCase: FindProductBySlugUseCase,
    private readonly findProductByNameUseCase: FindProductByNameUseCase,
    private readonly findAttributeValueByIdWithAttributeUseCase: FindAttributeValueByIdWithAttributeUseCase,
    private readonly createProductFAQUseCase: CreateProductFAQUseCase,
    private readonly createProductVariantUseCase: CreateProductVariantUseCase,
    private readonly createSimilarProductUseCase: CreateSimilarProductUseCase,
    private readonly createRelatedProductUseCase: CreateRelatedProductUseCase,
    private readonly updateProductFAQUseCase: UpdateProductFAQUseCase,
    private readonly updateProductVariantUseCase: UpdateProductVariantUseCase,
    private readonly deleteProductFAQUseCase: DeleteProductFAQUseCase,
    private readonly deleteRelatedProductUseCase: DeleteRelatedProductUseCase,
    private readonly deleteSimilarProductUseCase: DeleteSimilarProductUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductDTO,
    userId: string,
    files?: {
      desktopImages?: ProductFile[];
      mobileImages?: ProductFile[];
    },
  ) {
    const existingProduct = await this.findProductByIdUseCase.execute(id);

    if (dto.slug && existingProduct.slug !== dto.slug) {
      const existingSlug = await this.findProductBySlugUseCase
        .execute(dto.slug)
        .catch(() => null);

      if (existingSlug) {
        throw new BadRequestException('Esse slug já está em uso');
      }
    }

    if (dto.name && existingProduct.name !== dto.name) {
      const existingName = await this.findProductByNameUseCase
        .execute(dto.name)
        .catch(() => null);

      if (existingName) {
        throw new BadRequestException('Esse nome já está em uso');
      }
    }

    // Processa atualização de variantes se houver atributos enviados
    if (
      dto.productVariants &&
      dto.productVariants.length > 0 &&
      dto.productVariants[0].productVariantAttributes &&
      dto.productVariants[0].productVariantAttributes.length > 0
    ) {
      const mainVariant = dto.productVariants[0];
      const sentAttributeValueIds = mainVariant.productVariantAttributes;

      // Busca variantes existentes
      const existingVariants =
        await this.productRepository.findVariantsWithDetails(id);

      // Busca informações de todos os atributos enviados para identificar tipos
      const attributeResults = await Promise.allSettled(
        sentAttributeValueIds.map(async (valueId) => {
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

      existingVariants.forEach((variant) => {
        variant.productVariantAttributes.forEach((attr) => {
          // Precisamos buscar o attributeId de cada attributeValueId existente
          // Mas como não temos isso direto, vamos usar outra abordagem
        });
      });

      // Agrupa atributos enviados por attributeId
      const sentAttributesByType: Record<string, string[]> = {};
      for (const val of attributeValues) {
        if (!sentAttributesByType[val.attributeId]) {
          sentAttributesByType[val.attributeId] = [];
        }
        sentAttributesByType[val.attributeId].push(val.id);
      }

      // Para cada variante existente, adiciona os atributos que faltam
      for (const existingVariant of existingVariants) {
        const existingAttributeValueIds =
          existingVariant.productVariantAttributes.map(
            (attr) => attr.attributeValueId,
          );

        // Busca os attributeIds dos atributos existentes nesta variante
        const existingAttributeTypes = await Promise.allSettled(
          existingAttributeValueIds.map(async (valueId) => {
            const value =
              await this.findAttributeValueByIdWithAttributeUseCase.execute(
                valueId,
              );
            return value.attributeId;
          }),
        );

        const existingTypeIds = existingAttributeTypes
          .filter(
            (res): res is PromiseFulfilledResult<string> =>
              res.status === 'fulfilled',
          )
          .map((res) => res.value);

        // Identifica quais tipos de atributos faltam nesta variante
        const missingAttributeTypes = Object.keys(sentAttributesByType).filter(
          (typeId) => !existingTypeIds.includes(typeId),
        );

        // Para cada tipo de atributo que falta, adiciona TODOS os valores desse tipo
        // Isso vai gerar todas as combinações necessárias
        const attributesToAdd: string[] = [];
        for (const missingType of missingAttributeTypes) {
          const valuesForType = sentAttributesByType[missingType];
          if (valuesForType && valuesForType.length > 0) {
            // Adiciona todos os valores desse tipo
            attributesToAdd.push(...valuesForType);
          }
        }

        // Se há múltiplos tipos de atributos faltando, precisa criar novas variantes
        // para cada combinação. Por enquanto, adiciona apenas o primeiro de cada tipo
        // para evitar criar muitas variantes de uma vez
        if (missingAttributeTypes.length === 1) {
          // Se há apenas um tipo faltando, adiciona todos os valores desse tipo
          // criando uma nova variante para cada valor
          const missingType = missingAttributeTypes[0];
          const valuesForType = sentAttributesByType[missingType];

          if (valuesForType && valuesForType.length > 0) {
            // Adiciona o primeiro valor à variante existente
            await this.productRepository.addAttributesToVariant(
              existingVariant.id,
              [valuesForType[0]],
            );

            // Para os demais valores, cria novas variantes baseadas nesta
            for (let i = 1; i < valuesForType.length; i++) {
              const newVariantId = uuidv4();
              await this.createProductVariantUseCase.execute({
                id: newVariantId,
                productId: id,
                barCode: existingVariant.barCode,
                discountPix: existingVariant.discountPix,
                discountPrice: existingVariant.discountPrice,
                height: existingVariant.height,
                isActive: existingVariant.isActive,
                length: existingVariant.length,
                price: existingVariant.price,
                sku: existingVariant.sku + i,
                weight: existingVariant.weight,
                width: existingVariant.width,
                productVariantAttributes: [
                  ...existingAttributeValueIds,
                  valuesForType[i],
                ],
                seoCanonicalUrl: existingVariant.seoCanonicalUrl,
                seoDescription: existingVariant.seoDescription,
                seoKeywords: existingVariant.seoKeywords,
                seoMetaRobots: existingVariant.seoMetaRobots,
                seoTitle: existingVariant.seoTitle,
                stock: existingVariant.stock,
              });
            }
          }
        } else if (missingAttributeTypes.length > 1) {
          // Se há múltiplos tipos faltando, adiciona apenas o primeiro de cada
          // (a lógica de combinações será tratada depois)
          const firstValues: string[] = [];
          for (const missingType of missingAttributeTypes) {
            const valuesForType = sentAttributesByType[missingType];
            if (valuesForType && valuesForType.length > 0) {
              firstValues.push(valuesForType[0]);
            }
          }
          if (firstValues.length > 0) {
            await this.productRepository.addAttributesToVariant(
              existingVariant.id,
              firstValues,
            );
          }
        }
      }

      // Gera todas as combinações possíveis dos atributos enviados
      // para criar variantes que ainda não existem
      const grouped: Record<string, string[]> = {};
      for (const val of attributeValues) {
        if (!grouped[val.attributeId]) grouped[val.attributeId] = [];
        grouped[val.attributeId].push(val.id);
      }

      const combinations = this.cartesian(Object.values(grouped));

      // Cria um mapa de variantes existentes (após adicionar os atributos)
      const updatedVariants =
        await this.productRepository.findVariantsWithDetails(id);
      const existingVariantsMap = new Map<string, boolean>();
      updatedVariants.forEach((variant) => {
        const attributeIds = variant.productVariantAttributes
          .map((attr) => attr.attributeValueId)
          .sort()
          .join(',');
        existingVariantsMap.set(attributeIds, true);
      });

      // Cria apenas as variantes que não existem
      const baseVariant =
        updatedVariants.length > 0 ? updatedVariants[0] : null;
      let skuIncrement = 0;

      for (const combo of combinations) {
        const comboKey = combo.sort().join(',');
        if (!existingVariantsMap.has(comboKey)) {
          const variantData = baseVariant
            ? {
                barCode: mainVariant.barCode ?? baseVariant.barCode,
                discountPix: mainVariant.discountPix ?? baseVariant.discountPix,
                discountPrice:
                  mainVariant.discountPrice ?? baseVariant.discountPrice,
                height: mainVariant.height ?? baseVariant.height,
                isActive: mainVariant.isActive ?? baseVariant.isActive,
                length: mainVariant.length ?? baseVariant.length,
                price: mainVariant.price ?? baseVariant.price,
                sku: (baseVariant.sku ?? mainVariant.sku ?? 0) + skuIncrement,
                weight: mainVariant.weight ?? baseVariant.weight,
                width: mainVariant.width ?? baseVariant.width,
                seoCanonicalUrl:
                  mainVariant.seoCanonicalUrl ?? baseVariant.seoCanonicalUrl,
                seoDescription:
                  mainVariant.seoDescription ?? baseVariant.seoDescription,
                seoKeywords: mainVariant.seoKeywords ?? baseVariant.seoKeywords,
                seoMetaRobots:
                  mainVariant.seoMetaRobots ?? baseVariant.seoMetaRobots,
                seoTitle: mainVariant.seoTitle ?? baseVariant.seoTitle,
                stock: mainVariant.stock ?? baseVariant.stock,
              }
            : {
                barCode: mainVariant.barCode,
                discountPix: mainVariant.discountPix,
                discountPrice: mainVariant.discountPrice,
                height: mainVariant.height,
                isActive: mainVariant.isActive ?? true,
                length: mainVariant.length,
                price: mainVariant.price,
                sku: (mainVariant.sku ?? 0) + skuIncrement,
                weight: mainVariant.weight,
                width: mainVariant.width,
                seoCanonicalUrl: mainVariant.seoCanonicalUrl,
                seoDescription: mainVariant.seoDescription,
                seoKeywords: mainVariant.seoKeywords,
                seoMetaRobots: mainVariant.seoMetaRobots,
                seoTitle: mainVariant.seoTitle,
                stock: mainVariant.stock,
              };

          await this.createProductVariantUseCase.execute({
            id: uuidv4(),
            productId: id,
            ...variantData,
            productVariantAttributes: combo,
          });

          skuIncrement++;
        }
      }

      // Deleta variantes que não têm os atributos mantidos
      await this.productRepository.deleteAttributeValuesVariant(
        id,
        sentAttributeValueIds,
        userId,
      );
    } else if (
      dto.productVariants &&
      dto.productVariants.length > 0 &&
      (!dto.productVariants[0].productVariantAttributes ||
        dto.productVariants[0].productVariantAttributes.length === 0)
    ) {
      // Se não houver atributos, apenas atualiza a primeira variante existente
      const mainVariant = dto.productVariants[0];
      const remainingVariants =
        await this.productRepository.findVariantsWithDetails(id);

      if (mainVariant && remainingVariants.length > 0) {
        const firstVariant = remainingVariants[0];
        await this.updateProductVariantUseCase.execute(firstVariant.id, {
          barCode: mainVariant.barCode ?? firstVariant.barCode,
          discountPix: mainVariant.discountPix ?? firstVariant.discountPix,
          discountPrice:
            mainVariant.discountPrice ?? firstVariant.discountPrice,
          height: mainVariant.height ?? firstVariant.height,
          isActive: mainVariant.isActive ?? firstVariant.isActive,
          length: mainVariant.length ?? firstVariant.length,
          price: mainVariant.price ?? firstVariant.price,
          sku: mainVariant.sku ?? firstVariant.sku,
          weight: mainVariant.weight ?? firstVariant.weight,
          width: mainVariant.width ?? firstVariant.width,
          productVariantAttributes: [],
          seoCanonicalUrl:
            mainVariant.seoCanonicalUrl ?? firstVariant.seoCanonicalUrl,
          seoDescription:
            mainVariant.seoDescription ?? firstVariant.seoDescription,
          seoKeywords: mainVariant.seoKeywords ?? firstVariant.seoKeywords,
          seoMetaRobots:
            mainVariant.seoMetaRobots ?? firstVariant.seoMetaRobots,
          seoTitle: mainVariant.seoTitle ?? firstVariant.seoTitle,
          stock: mainVariant.stock ?? firstVariant.stock,
        });
      }
    }

    const upDateProductDTO = {
      name: dto.name,
      slug: dto.slug,
      categories: dto.categories ?? existingProduct.categories,
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
    };

    await this.productRepository.update(id, upDateProductDTO, userId);

    if (dto.productFAQ && dto.productFAQ.length > 0) {
      // Busca FAQs existentes
      const existingFAQs = existingProduct.productFAQs;
      const existingFAQIds = existingFAQs.map((faq) => faq.id);
      const maintainFAQIds = dto.productFAQ
        .filter((faq) => faq.id)
        .map((faq) => faq.id);

      // Deleta FAQs que não estão mais na lista
      for (const faq of existingFAQs) {
        if (!maintainFAQIds.includes(faq.id)) {
          await this.deleteProductFAQUseCase
            .execute(faq.id, userId)
            .catch(() => null);
        }
      }

      // Cria ou atualiza FAQs
      for (const faq of dto.productFAQ) {
        if (faq.id && existingFAQIds.includes(faq.id)) {
          // Atualiza FAQ existente
          await this.updateProductFAQUseCase.execute(
            faq.id,
            {
              question: faq.question,
              answer: faq.answer,
            },
            '',
          );
        } else {
          // Cria novo FAQ
          await this.createProductFAQUseCase
            .execute({
              id: '',
              productId: id,
              question: faq.question,
              answer: faq.answer,
            })
            .catch(() => null);
        }
      }
    }

    // Atualiza produtos relacionados (se enviados)
    if (dto.relatedProducts && dto.relatedProducts.length > 0) {
      const existingRelated = existingProduct.relatedProducts;
      for (const related of existingRelated) {
        await this.deleteRelatedProductUseCase
          .execute(related, userId)
          .catch(() => null);
      }

      await Promise.all(
        dto.relatedProducts.map(async (related) => {
          try {
            return await this.createRelatedProductUseCase.execute(related);
          } catch {
            return null;
          }
        }),
      );
    }

    // Atualiza produtos similares (se enviados)
    if (dto.similarProducts && dto.similarProducts.length > 0) {
      const existingSimilar = existingProduct.similarProducts;
      for (const similar of existingSimilar) {
        await this.deleteSimilarProductUseCase
          .execute(similar, userId)
          .catch(() => null);
      }

      await Promise.all(
        dto.similarProducts.map(async (similar) => {
          try {
            return await this.createSimilarProductUseCase.execute(similar);
          } catch {
            return null;
          }
        }),
      );
    }
  }

  private cartesian(arrays: string[][]): string[][] {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]],
    );
  }
}
