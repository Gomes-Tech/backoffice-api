import {
  CreateTokenPasswordUseCase,
  UpdateTokenPasswordUseCase,
  VerifyTokenPasswordUseCase,
} from '@app/token-password';
import { PrismaTokenPasswordRepository } from '@infra/prisma';
import { MailModule } from '@infra/providers';
import { Module } from '@nestjs/common';

@Module({
  imports: [MailModule],
  controllers: [],
  providers: [
    VerifyTokenPasswordUseCase,
    UpdateTokenPasswordUseCase,
    CreateTokenPasswordUseCase,
    PrismaTokenPasswordRepository,
    {
      provide: 'TokenPasswordRepository',
      useExisting: PrismaTokenPasswordRepository,
    },
  ],
  exports: [
    VerifyTokenPasswordUseCase,
    UpdateTokenPasswordUseCase,
    CreateTokenPasswordUseCase,
    PrismaTokenPasswordRepository,
    {
      provide: 'TokenPasswordRepository',
      useExisting: PrismaTokenPasswordRepository,
    },
  ],
})
export class TokenPasswordModule {}
