import {
  CreateStoreBenefit,
  StoreBenefitRepository,
  StoreBenefitType,
} from '@domain/store-benefit';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { CreateStoreBenefitDTO } from '@interfaces/http/dtos';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateStoreBenefitUseCase {
  constructor(
    @Inject('StoreBenefitRepository')
    private readonly storeBenefitRepository: StoreBenefitRepository,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateStoreBenefitDTO,
    userId: string,
    image?: Express.Multer.File,
  ): Promise<void> {
    let imageUrl: string | null = null;
    let imageKey: string | null = null;

    if (image) {
      const uploaded = await this.storageService.uploadFile(
        'store-benefits',
        image.originalname,
        image.buffer,
      );

      imageUrl = uploaded.publicUrl;
      imageKey = uploaded.path;
    }

    const data: CreateStoreBenefit = {
      id: uuidv4(),
      title: dto.title,
      subtitle: dto.subtitle ?? null,
      type: dto.type as StoreBenefitType,
      imageUrl,
      imageKey,
      modalContent: dto.modalContent ?? null,
      link: dto.link ?? null,
      linkText: dto.linkText ?? null,
      order: dto.order,
      createdBy: userId,
    };

    await this.storeBenefitRepository.create(data);
    await this.cacheService.del('store_benefits');
  }
}
