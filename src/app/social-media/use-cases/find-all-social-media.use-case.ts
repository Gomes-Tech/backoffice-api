import { SocialMedia, SocialMediaRepository } from '@domain/social-media';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<SocialMedia[]> {
    const cachedSocialMedias =
      await this.cacheService.get<SocialMedia[]>('social_media');

    if (cachedSocialMedias) {
      return cachedSocialMedias;
    }

    const socialMedias = await this.socialMediaRepository.findAll();

    await this.cacheService.set('social_media', socialMedias);

    return socialMedias;
  }
}
