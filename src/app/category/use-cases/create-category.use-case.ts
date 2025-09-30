import { CreateCategoryFAQUseCase } from '@app/category-faq';
import { CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { CreateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly createCategoryFAQUseCase: CreateCategoryFAQUseCase,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateCategoryDTO,
    image: Express.Multer.File,
    userId: string,
  ): Promise<void> {
    let data = null;

    if (image) {
      const imageUrl = await this.storageService.uploadFile(
        'category',
        image.originalname,
        image.buffer,
      );

      data = {
        categoryImageUrl: imageUrl.publicUrl,
        categoryImageKey: imageUrl.path,
      };
    }

    const categoryId = uuidv4();

    await this.categoryRepository.create({
      id: categoryId,
      ...dto,
      categoryImageUrl: data.categoryImageUrl,
      categoryImageKey: data.categoryImageKey,
      createdBy: userId,
    });

    dto.categoryFAQ?.map(
      async (faq) =>
        await this.createCategoryFAQUseCase
          .execute({
            id: '',
            ...faq,
            categoryId,
          })
          .catch(() => null),
    );

    await this.cacheService.del('categories:tree');
    await this.cacheService.del('categories');
  }
}
