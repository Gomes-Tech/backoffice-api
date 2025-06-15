import { SocialMedia, SocialMediaRepository } from '@domain/social-media';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
  ) {}

  async execute(): Promise<SocialMedia[]> {
    return await this.socialMediaRepository.findAll();
  }
}
