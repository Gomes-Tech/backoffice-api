import { CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { BadRequestException } from '@infra/filters';
import { PrismaService } from '@infra/prisma';
import { StorageService } from '@infra/providers';
import { UpdateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FindCategoryByIdUseCase } from './find-category-by-id.use-case';
import { FindCategoryByNameUseCase } from './find-category-by-name.use-case';
import { FindCategoryBySlugUseCase } from './find-category-by-slug.use-case';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
    private readonly findCastegoryByIdUseCase: FindCategoryByIdUseCase,
    private readonly findCategoryByNameUseCase: FindCategoryByNameUseCase,
    private readonly findCategoryBySlugUseCase: FindCategoryBySlugUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateCategoryDTO,
    image: Express.Multer.File,
    userId: string,
  ): Promise<void> {
    await this.findCastegoryByIdUseCase.execute(id);

    const categoryName = await this.findCategoryByNameUseCase
      .execute(dto.name)
      .catch(() => null);

    const categorySlug = await this.findCategoryBySlugUseCase
      .execute(dto.slug)
      .catch(() => null);

    if (categoryName || categorySlug) {
      throw new BadRequestException('Esse nome ou slug já está em uso');
    }

    // Upload de imagem antes da transação (operação externa)
    let imageData = {
      categoryImageUrl: dto.categoryImageUrl,
      categoryImageKey: undefined,
    };

    if (image) {
      const imageUrl = await this.storageService.uploadFile(
        'category',
        image.originalname,
        image.buffer,
      );

      imageData = {
        categoryImageUrl: imageUrl.publicUrl,
        categoryImageKey: imageUrl.path,
      };
    }

    // Buscar FAQs existentes antes da transação (operação de leitura)
    const existingCategory = await this.categoryRepository.findById(id);
    const existingFAQIds =
      existingCategory?.categoryFAQ?.map((faq) => faq.id) || [];
    const maintainFAQIds =
      dto.categoryFAQ?.filter((faq) => faq.id).map((faq) => faq.id!) || [];

    // Executar todas as operações de escrita dentro de uma transação
    await this.prismaService.$transaction(
      async (tx) => {
        // 1. Atualizar categoria
        await tx.category.update({
          where: { id },
          data: {
            name: dto.name,
            slug: dto.slug,
            isActive: dto.isActive,
            showMenu: dto.showMenu,
            showCarousel: dto.showCarousel,
            categoryImageUrl:
              imageData.categoryImageUrl ?? dto.categoryImageUrl,
            categoryImageKey: imageData.categoryImageKey,
            seoTitle: dto.seoTitle,
            seoDescription: dto.seoDescription,
            seoKeywords: dto.seoKeywords,
            seoCanonicalUrl: dto.seoCanonicalUrl,
            seoMetaRobots: dto.seoMetaRobots,
            ...(dto.parentId !== undefined && {
              parent: dto.parentId
                ? { connect: { id: dto.parentId } }
                : { disconnect: true },
            }),
            updatedBy: { connect: { id: userId } },
          },
        });

        // 2. Deletar FAQs que não estão mais na lista
        const faqsToDelete = existingFAQIds.filter(
          (faqId) => !maintainFAQIds.includes(faqId),
        );

        if (faqsToDelete.length > 0) {
          await tx.categoryFAQ.deleteMany({
            where: {
              id: { in: faqsToDelete },
              categoryId: id,
            },
          });
        }

        // 3. Criar ou atualizar FAQs
        if (dto.categoryFAQ && dto.categoryFAQ.length > 0) {
          await Promise.all(
            dto.categoryFAQ.map((faq) => {
              if (faq.id && existingFAQIds.includes(faq.id)) {
                // Atualizar FAQ existente
                return tx.categoryFAQ.update({
                  where: { id: faq.id },
                  data: {
                    question: faq.question,
                    answer: faq.answer,
                  },
                });
              } else {
                // Criar novo FAQ
                return tx.categoryFAQ.create({
                  data: {
                    id: uuidv4(),
                    question: faq.question,
                    answer: faq.answer,
                    category: { connect: { id } },
                  },
                });
              }
            }),
          );
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    // Invalidar cache após a transação (operação externa)
    await this.cacheService.del('categories:tree');
    await this.cacheService.del('categories');
  }
}
