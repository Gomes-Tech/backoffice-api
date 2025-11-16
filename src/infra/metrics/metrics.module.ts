import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

const isProduction = process.env.NODE_ENV === 'prod';

@Global()
@Module({
  providers: [MetricsService],
  controllers: isProduction ? [] : [MetricsController],
  exports: [MetricsService],
})
export class MetricsModule {}

