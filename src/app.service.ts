import { Injectable } from '@nestjs/common';
import { AdvancedLoggerService } from '@infra/logger';

@Injectable()
export class AppService {
  constructor(private readonly logger: AdvancedLoggerService) {
    this.logger.setContext('AppService');
  }

  getHello(): string {
    // Log básico
    this.logger.log('getHello method called');

    // Log de debug (apenas em desenvolvimento)
    this.logger.debug(`Environment: ${process.env.NODE_ENV}`);

    // Log estruturado
    this.logger.logStructured('info', 'Health check', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      status: 'healthy',
    });

    return 'Hello World! => ' + process.env.NODE_ENV;
  }
}
