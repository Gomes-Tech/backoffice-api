import { Public } from '@interfaces/http';
import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Public()
@Controller('metrics')
export class MetricsController {
  private readonly isProduction = process.env.NODE_ENV === 'prod';

  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    // Em produção, retorna vazio
    if (this.isProduction) {
      return '# Métricas desabilitadas em produção\n';
    }
    const metrics = await this.metricsService.getMetrics();
    return metrics;
  }
}
