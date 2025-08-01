import { ListSocialMedia, SocialMediaRepository } from '@domain/social-media';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListAllSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(): Promise<ListSocialMedia[]> {
    const cachedSocialMedias =
      await this.cacheService.get<ListSocialMedia[]>('list_social_media');

    if (cachedSocialMedias) {
      return cachedSocialMedias;
    }

    const socialMedias = await this.socialMediaRepository.list();

    await this.cacheService.set('list_social_media', socialMedias);

    return socialMedias;
  }
}
