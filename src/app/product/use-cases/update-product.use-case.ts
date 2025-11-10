import {
  CreateProductFAQUseCase,
  DeleteProductFAQUseCase,
  UpdateProductFAQUseCase,
} from '@app/product-faq';
import {
  CreateRelatedProductUseCase,
  DeleteRelatedProductUseCase,
  FindRelatedProductsByProductIdUseCase,
} from '@app/related-product';
import {
  CreateSimilarProductUseCase,
  DeleteSimilarProductUseCase,
  FindSimilarProductsByProductIdUseCase,
} from '@app/similar-product';
import { ProductRepository } from '@domain/product';
import { BadRequestException } from '@infra/filters';
import { StorageService } from '@infra/providers';
import { UpdateProductDTO } from '@interfaces/http';
import { ProductFile } from '@interfaces/http/controllers';
import { Injectable } from '@nestjs/common';
import { FindProductByIdUseCase } from './find-product-by-id.use-case';
import { FindProductByNameUseCase } from './find-product-by-name.use-case';
import { FindProductBySlugUseCase } from './find-product-by-slug.use-case';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storageService: StorageService,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly findProductBySlugUseCase: FindProductBySlugUseCase,
    private readonly findProductByNameUseCase: FindProductByNameUseCase,
    private readonly createProductFAQUseCase: CreateProductFAQUseCase,
    private readonly updateProductFAQUseCase: UpdateProductFAQUseCase,
    private readonly deleteProductFAQUseCase: DeleteProductFAQUseCase,
    private readonly deleteRelatedProductUseCase: DeleteRelatedProductUseCase,
    private readonly findRelatedProductsByProductIdUseCase: FindRelatedProductsByProductIdUseCase,
    private readonly createRelatedProductUseCase: CreateRelatedProductUseCase,
    private readonly findSimilarProductsByProductIdUseCase: FindSimilarProductsByProductIdUseCase,
    private readonly deleteSimilarProductUseCase: DeleteSimilarProductUseCase,
    private readonly createSimilarProductUseCase: CreateSimilarProductUseCase,
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

    const upDateProductDTO = {
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
    };

    await this.productRepository.update(id, upDateProductDTO, userId);

    if (dto.productFAQ && dto.productFAQ.length > 0) {
      // Busca FAQs existentes
      const existingFAQs = existingProduct.productFAQs;
      const existingFAQIds = existingFAQs.map((faq) => faq.id);
      const newFAQIds = dto.productFAQ
        .filter((faq) => faq.id)
        .map((faq) => faq.id);

      // Deleta FAQs que não estão mais na lista
      for (const faq of existingFAQs) {
        if (!newFAQIds.includes(faq.id)) {
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
    if (dto.relatedProducts) {
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
    if (dto.similarProducts) {
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

    // Gerencia variações do produto
    const mainVariant = dto.productVariants[0];
    const existingVariants = existingProduct.productVariants;

    let createdVariantIds: string[] = [];
    let variantsToKeep: string[] = [];
  }

  private cartesian(arrays: string[][]): string[][] {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]],
    );
  }

  private compareAttributeCombinations(
    existing: string[],
    newCombo: string[],
  ): boolean {
    if (existing.length !== newCombo.length) return false;
    const sortedExisting = [...existing].sort();
    const sortedNew = [...newCombo].sort();
    return sortedExisting.every((val, idx) => val === sortedNew[idx]);
  }
}
