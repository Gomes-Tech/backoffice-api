import { Module } from '@nestjs/common';
import { HealthCheckModule } from '@infra/health';
import { HealthController } from '../controllers/health';

@Module({
  imports: [HealthCheckModule],
  controllers: [HealthController],
})
export class HealthModule {}

