import { ProductRepository } from '@domain/product';
import { BadRequestException } from '@infra/filters';
import { UpdateProductDTO } from '@interfaces/http';
import { Injectable } from '@nestjs/common';
import { FindProductByIdUseCase } from './find-product-by-id.use-case';
import { FindProductByNameUseCase } from './find-product-by-name.use-case';
import { FindProductBySlugUseCase } from './find-product-by-slug.use-case';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly findProductBySlugUseCase: FindProductBySlugUseCase,
    private readonly findProductByNameUseCase: FindProductByNameUseCase,
  ) {}

  async execute(id: string, dto: UpdateProductDTO, userId: string) {
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
  }
}
