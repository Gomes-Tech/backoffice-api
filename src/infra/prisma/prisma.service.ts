import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Optional() private readonly metricsService?: MetricsService) {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === 'dev' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Configurar middleware após conectar
    if (this.metricsService) {
      this.$use(async (params, next) => {
        const startTime = Date.now();
        const model = params.model || 'unknown';
        const action = params.action;

        try {
          const result = await next(params);
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService?.recordDbQuery(action, model, duration, true);
          return result;
        } catch (error) {
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService?.recordDbQuery(action, model, duration, false);
          throw error;
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
