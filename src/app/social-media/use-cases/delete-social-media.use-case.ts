import { SocialMediaRepository } from '@domain/social-media';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly SocialMediaRepository: SocialMediaRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(socialMediaId: string, userId: string): Promise<void> {
    const SocialMedia =
      await this.SocialMediaRepository.findById(socialMediaId);

    if (!SocialMedia) {
      throw new Error(`Esse Social Media não foi encontrado: ${socialMediaId}`);
    }

    await this.SocialMediaRepository.delete(socialMediaId, userId);

    await this.cacheService.del('social_media');
  }
}
