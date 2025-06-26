import { SocialMedia, SocialMediaRepository } from '@domain/social-media';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindSocialMediaByIdUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<Omit<SocialMedia, 'createdBy' | 'createdAt'>> {
    const socialMedia = await this.socialMediaRepository.findById(id);

    if (!socialMedia) {
      throw new NotFoundException('Social Media não encontrado');
    }

    return socialMedia;
  }
}
