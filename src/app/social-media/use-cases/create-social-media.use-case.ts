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
    header: Express.Multer.File,
    footer: Express.Multer.File,
  ): Promise<void> {
    const [headerUpload, footerUpload] = await Promise.all([
      this.storageService.uploadFile(
        'social-medias',
        header.originalname,
        header.buffer,
      ),
      this.storageService.uploadFile(
        'social-medias',
        footer.originalname,
        footer.buffer,
      ),
    ]);

    const data: CreateSocialMedia = {
      id: uuidv4(),
      createdBy: userId,
      ...dto,
      headerImageUrl: headerUpload.publicUrl,
      headerImageKey: headerUpload.path,
      headerImageAlt: dto.name,
      footerImageUrl: footerUpload.publicUrl,
      footerImageKey: footerUpload.path,
      footerImageAlt: dto.name,
    };

    await this.socialMediaRepository.create(data);

    await this.cacheService.del('social_media');
    await this.cacheService.del('list_social_media');
  }
}
