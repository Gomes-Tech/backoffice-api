import { Public } from '@interfaces/http/decorators';
import { HealthCheckService } from '@infra/health';
import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOperation({ summary: 'Health check completo' })
  @ApiResponse({
    status: 200,
    description: 'Status completo da aplicação',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço indisponível',
  })
  async healthCheck(@Res() res: Response) {
    const health = await this.healthCheckService.checkHealth();
    const statusCode =
      health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(health);
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está viva',
  })
  async liveness() {
    return await this.healthCheckService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está pronta para receber tráfego',
  })
  @ApiResponse({
    status: 503,
    description: 'Aplicação não está pronta',
  })
  async readiness(@Res() res: Response) {
    const readiness = await this.healthCheckService.checkReadiness();
    const statusCode =
      readiness.status === 'ok'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(readiness);
  }
}

