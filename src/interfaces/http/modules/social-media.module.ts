import {
  CreateSocialMediaUseCase,
  DeleteSocialMediaUseCase,
  FindAllSocialMediaUseCase,
  FindSocialMediaByIdUseCase,
  UpdateSocialMediaUseCase,
} from '@app/social-media';
import { ListAllSocialMediaUseCase } from '@app/social-media/use-cases/list-all-social-media.use-case';
import { PrismaSocialMediaRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { SocialMediaController } from '../controllers';

@Module({
  imports: [],
  controllers: [SocialMediaController],
  providers: [
    FindAllSocialMediaUseCase,
    ListAllSocialMediaUseCase,
    FindSocialMediaByIdUseCase,
    CreateSocialMediaUseCase,
    UpdateSocialMediaUseCase,
    DeleteSocialMediaUseCase,
    PrismaSocialMediaRepository,
    {
      provide: 'SocialMediaRepository',
      useExisting: PrismaSocialMediaRepository,
    },
  ],
  exports: [
    FindAllSocialMediaUseCase,
    ListAllSocialMediaUseCase,
    FindSocialMediaByIdUseCase,
    CreateSocialMediaUseCase,
    UpdateSocialMediaUseCase,
    DeleteSocialMediaUseCase,
    PrismaSocialMediaRepository,
    {
      provide: 'SocialMediaRepository',
      useExisting: PrismaSocialMediaRepository,
    },
  ],
})
export class SocialMediaModule {}
