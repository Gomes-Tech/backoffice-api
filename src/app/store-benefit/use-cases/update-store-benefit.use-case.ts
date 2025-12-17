import { StoreBenefitRepository } from '@domain/store-benefit';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { UpdateStoreBenefitDTO } from '@interfaces/http/dtos';
import { Inject, Injectable } from '@nestjs/common';
import { FindStoreBenefitByIdUseCase } from './find-store-benefit-by-id.use-case';

@Injectable()
export class UpdateStoreBenefitUseCase {
  constructor(
    @Inject('StoreBenefitRepository')
    private readonly storeBenefitRepository: StoreBenefitRepository,
    private readonly findStoreBenefitByIdUseCase: FindStoreBenefitByIdUseCase,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    id: string,
    dto: UpdateStoreBenefitDTO,
    userId: string,
    image?: Express.Multer.File,
  ): Promise<void> {
    const existing = await this.findStoreBenefitByIdUseCase.execute(id);

    let imageUrl = existing.imageUrl ?? null;
    let imageKey = existing.imageKey ?? null;

    if (image) {
      const uploaded = await this.storageService.uploadFile(
        'store-benefits',
        image.originalname,
        image.buffer,
      );
      imageUrl = uploaded.publicUrl;
      imageKey = uploaded.path;
    }

    await this.storeBenefitRepository.update(
      id,
      {
        ...dto,
        imageUrl,
        imageKey,
        updatedBy: userId,
      },
      userId,
    );

    await this.cacheService.del('store_benefits');
  }
}


