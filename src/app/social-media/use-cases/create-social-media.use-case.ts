import { SocialMediaRepository } from '@domain/social-media';
import { CreateSocialMediaDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateSocialMediaUseCase {
  constructor(
    @Inject('SocialMediaRepository')
    private readonly socialMediaRepository: SocialMediaRepository,
  ) {}

  async execute(dto: CreateSocialMediaDTO, userId: string): Promise<void> {
    await this.socialMediaRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
    });
  }
}
