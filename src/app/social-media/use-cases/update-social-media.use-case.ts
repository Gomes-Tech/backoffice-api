import { SocialMediaRepository } from '@domain/social-media';
import { CacheService } from '@infra/cache';
import { UpdateSocialMediaDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    id: string,
    dto: UpdateSocialMediaDTO,
    userId: string,
  ): Promise<void> {
    await this.socialMediaRepository.update(
      id,
      {
        ...dto,
        updatedBy: userId,
      },
      '',
    );

    await this.cacheService.del('social_media');
  }
}
