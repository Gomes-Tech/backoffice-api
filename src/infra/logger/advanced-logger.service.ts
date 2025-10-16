import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { winstonLogger } from './winston.config';
import * as Sentry from '@sentry/node';

/**
 * Logger Service Avançado
 * Integra Winston (logs em arquivo) e Sentry (monitoramento de erros)
 */

@Injectable({ scope: Scope.TRANSIENT })
export class AdvancedLoggerService implements LoggerService {
  private context?: string;
  private isSentryEnabled: boolean;

  constructor() {
    this.isSentryEnabled = !!process.env.SENTRY_DSN;
  }

  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log de informação
   */
  log(message: any, context?: string) {
    const logContext = context || this.context || 'Application';
    const metadata = this.buildMetadata(message, logContext);

    winstonLogger.info(this.formatMessage(message), metadata);
  }

  /**
   * Log de erro
   * Envia automaticamente para o Sentry se configurado
   */
  error(message: any, trace?: string, context?: string) {
    const logContext = context || this.context || 'Application';
    const metadata = this.buildMetadata(message, logContext, trace);

    winstonLogger.error(this.formatMessage(message), metadata);

    // Envia para o Sentry se estiver configurado
    if (this.isSentryEnabled) {
      if (message instanceof Error) {
        Sentry.captureException(message, {
          tags: { context: logContext },
          extra: { trace },
        });
      } else {
        Sentry.captureMessage(this.formatMessage(message), {
          level: 'error',
          tags: { context: logContext },
          extra: { trace },
        });
      }
    }
  }

  /**
   * Log de aviso
   */
  warn(message: any, context?: string) {
    const logContext = context || this.context || 'Application';
    const metadata = this.buildMetadata(message, logContext);

    winstonLogger.warn(this.formatMessage(message), metadata);

    // Envia avisos críticos para o Sentry
    if (this.isSentryEnabled && this.isCriticalWarning(message)) {
      Sentry.captureMessage(this.formatMessage(message), {
        level: 'warning',
        tags: { context: logContext },
      });
    }
  }

  /**
   * Log de debug (desabilitado em produção)
   */
  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'prod') return;

    const logContext = context || this.context || 'Application';
    const metadata = this.buildMetadata(message, logContext);

    winstonLogger.debug(this.formatMessage(message), metadata);
  }

  /**
   * Log verbose (desabilitado em produção)
   */
  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'prod') return;

    const logContext = context || this.context || 'Application';
    const metadata = this.buildMetadata(message, logContext);

    winstonLogger.verbose(this.formatMessage(message), metadata);
  }

  /**
   * Log estruturado com dados customizados
   */
  logStructured(
    level: 'info' | 'error' | 'warn' | 'debug',
    message: string,
    data?: Record<string, any>,
  ) {
    const logContext = this.context || 'Application';
    const metadata = {
      context: logContext,
      timestamp: new Date().toISOString(),
      ...data,
    };

    winstonLogger.log(level, message, metadata);
  }

  /**
   * Log de performance
   */
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    const logContext = this.context || 'Application';
    
    winstonLogger.info(`Performance: ${operation}`, {
      context: logContext,
      operation,
      duration,
      durationMs: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...metadata,
    });

    // Alerta se a operação for muito lenta
    if (duration > 5000) {
      this.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }
  }

  /**
   * Log de requisição HTTP
   */
  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>,
  ) {
    const logContext = this.context || 'HTTP';
    
    winstonLogger.info('HTTP Request', {
      context: logContext,
      method,
      url,
      statusCode,
      duration,
      durationMs: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Log de erro de banco de dados
   */
  logDatabaseError(operation: string, error: Error, metadata?: Record<string, any>) {
    const logContext = this.context || 'Database';
    
    winstonLogger.error(`Database Error: ${operation}`, {
      context: logContext,
      operation,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...metadata,
    });

    if (this.isSentryEnabled) {
      Sentry.captureException(error, {
        tags: { 
          context: logContext,
          operation,
          type: 'database_error',
        },
        extra: metadata,
      });
    }
  }

  /**
   * Formata a mensagem para string
   */
  private formatMessage(message: any): string {
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return String(message);
  }

  /**
   * Constrói metadados estruturados
   */
  private buildMetadata(
    message: any,
    context: string,
    trace?: string,
  ): Record<string, any> {
    const metadata: Record<string, any> = {
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    if (trace) {
      metadata.trace = trace;
    }

    if (typeof message === 'object' && !(message instanceof Error)) {
      metadata.data = message;
    }

    return metadata;
  }

  /**
   * Verifica se um aviso é crítico
   */
  private isCriticalWarning(message: any): boolean {
    const criticalKeywords = [
      'unauthorized',
      'forbidden',
      'security',
      'breach',
      'attack',
      'injection',
      'vulnerability',
    ];

    const messageStr = this.formatMessage(message).toLowerCase();
    return criticalKeywords.some((keyword) => messageStr.includes(keyword));
  }
}
