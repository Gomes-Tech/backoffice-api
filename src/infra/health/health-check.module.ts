import { Module } from '@nestjs/common';
import { CacheModule } from '@infra/cache';
import { PrismaModule } from '@infra/prisma';
import { HealthCheckService } from './health-check.service';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthCheckModule {}

