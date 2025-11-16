import { Module } from '@nestjs/common';
import { SecurityLoggerService } from './security-logger.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  providers: [SecurityLoggerService, TokenBlacklistService],
  exports: [SecurityLoggerService, TokenBlacklistService],
})
export class SecurityModule {}

