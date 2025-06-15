import { SocialMediaRepository } from '@domain/social-media';
import { UpdateSocialMediaDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateSocialMediaDTO,
    userId: string,
  ): Promise<void> {
    await this.socialMediaRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
