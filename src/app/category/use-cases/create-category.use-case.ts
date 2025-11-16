import { CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { PrismaService } from '@infra/prisma';
import { StorageService } from '@infra/providers';
import { CreateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateCategoryDTO,
    image: Express.Multer.File,
    userId: string,
  ): Promise<void> {
    // Upload de imagem antes da transação (operação externa)
    let imageData = null;

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

    const categoryId = uuidv4();

    // Executar todas as operações de escrita dentro de uma transação
    await this.prismaService.$transaction(
      async (tx) => {
        // 1. Criar categoria
        await tx.category.create({
          data: {
            id: categoryId,
            name: dto.name,
            slug: dto.slug,
            isActive: dto.isActive ?? true,
            showMenu: dto.showMenu ?? false,
            showCarousel: dto.showCarousel ?? false,
            categoryImageUrl: imageData?.categoryImageUrl,
            categoryImageKey: imageData?.categoryImageKey,
            seoTitle: dto.seoTitle,
            seoDescription: dto.seoDescription,
            seoKeywords: dto.seoKeywords,
            seoCanonicalUrl: dto.seoCanonicalUrl,
            seoMetaRobots: dto.seoMetaRobots,
            ...(dto.parentId && { parent: { connect: { id: dto.parentId } } }),
            createdBy: { connect: { id: userId } },
          },
        });

        // 2. Criar FAQs da categoria
        if (dto.categoryFAQ && dto.categoryFAQ.length > 0) {
          await Promise.all(
            dto.categoryFAQ.map((faq) =>
              tx.categoryFAQ.create({
                data: {
                  id: uuidv4(),
                  question: faq.question,
                  answer: faq.answer,
                  category: { connect: { id: categoryId } },
                },
              }),
            ),
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
