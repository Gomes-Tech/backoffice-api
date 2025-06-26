import { CreateSocialMedia, SocialMediaRepository } from '@domain/social-media';
import { CacheService } from '@infra/cache';
import { StorageService } from '@infra/providers';
import { CreateSocialMediaDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
    private readonly cacheService: CacheService,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    dto: CreateSocialMediaDTO,
    userId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const image = await this.storageService.uploadFile(
      'social-medias',
      file.originalname,
      file.buffer,
    );

    const data: CreateSocialMedia = {
      id: uuidv4(),
      createdBy: userId,
      ...dto,
      imageUrl: image.publicUrl,
      imageAlt: dto.name,
      imageKey: image.path,
    };

    await this.socialMediaRepository.create(data);

    await this.cacheService.del('social_media');
  }
}
