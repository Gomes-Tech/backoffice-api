import {
  CreateSocialMediaUseCase,
  DeleteSocialMediaUseCase,
  FindAllSocialMediaUseCase,
  FindSocialMediaByIdUseCase,
  UpdateSocialMediaUseCase,
} from '@app/social-media';
import { PrismaSocialMediaRepository } from '@infra/prisma';
import { Module } from '@nestjs/common';
import { SocialMediaController } from '../controllers';

@Module({
  imports: [],
  controllers: [SocialMediaController],
  providers: [
    FindAllSocialMediaUseCase,
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
