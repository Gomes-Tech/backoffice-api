import {
  CreateCategoryFAQUseCase,
  UpdateCategoryFAQUseCase,
} from '@app/category-faq';
import { CategoryRepository } from '@domain/category';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { UpdateCategoryDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
    private readonly createCategoryFAQUseCase: CreateCategoryFAQUseCase,
    private readonly updateCategoryFAQUseCase: UpdateCategoryFAQUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateCategoryDTO,
    image: Express.Multer.File,
    userId: string,
  ): Promise<void> {
    let data = {};

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

    data = {
      ...data,
      ...dto,
    };

    await this.categoryRepository.update(
      id,
      {
        ...dto,
        updatedBy: userId,
      },
      '',
    );

    dto.categoryFAQ?.map(async (faq) => {
      if (faq.id) {
        await this.updateCategoryFAQUseCase
          .execute(faq.id, {
            ...faq,
          })
          .catch(() => null);
      } else {
        await this.createCategoryFAQUseCase
          .execute({
            id: '',
            ...faq,
            categoryId: id,
          })
          .catch(() => null);
      }
    });

    await this.cacheService.del('categories:tree');
    await this.cacheService.del('categories');
  }
}
