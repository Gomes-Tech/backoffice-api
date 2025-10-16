import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Configuração do Sentry para monitoramento de erros
 *
 * Variáveis de ambiente necessárias:
 * - SENTRY_DSN: URL do projeto no Sentry
 * - SENTRY_ENVIRONMENT: Ambiente (development, staging, production)
 * - SENTRY_TRACES_SAMPLE_RATE: Taxa de amostragem de traces (0.0 a 1.0)
 */

export function initializeSentry() {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment:
      process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Taxa de amostragem de traces (performance monitoring)
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
    ),

    // Profiling (opcional)
    profilesSampleRate: parseFloat(
      process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1',
    ),

    integrations: [
      // Profiling de performance
      nodeProfilingIntegration(),

      // Captura informações de HTTP
      Sentry.httpIntegration(),
    ],

    // Filtra informações sensíveis
    beforeSend(event) {
      // Remove informações sensíveis dos logs
      if (event.request) {
        // Remove headers sensíveis
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }

        // Remove query params sensíveis
        if (event.request.query_string) {
          const sensitiveParams = ['password', 'token', 'api_key', 'secret'];
          const queryString = String(event.request.query_string);
          const hasSensitiveParam = sensitiveParams.some((param) =>
            queryString.includes(param),
          );

          if (hasSensitiveParam) {
            event.request.query_string = '[FILTERED]';
          }
        }
      }

      // Remove dados sensíveis do contexto
      if (event.contexts) {
        if (event.contexts.user) {
          delete event.contexts.user.email;
          delete event.contexts.user.ip_address;
        }
      }

      return event;
    },

    // Ignora erros específicos
    ignoreErrors: [
      // Erros de rede comuns
      'Network request failed',
      'NetworkError',
      'Failed to fetch',

      // Erros de timeout
      'timeout',
      'ETIMEDOUT',

      // Erros de validação (já tratados pela aplicação)
      'ValidationError',
      'Bad Request',
    ],

    // Tags padrão
    initialScope: {
      tags: {
        app: 'backoffice-api',
        version: process.env.npm_package_version || '1.0.0',
      },
    },
  });

  console.log('✅ Sentry initialized successfully');
}

/**
 * Captura exceção manualmente
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Captura mensagem manualmente
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
) {
  Sentry.captureMessage(message, level);
}

/**
 * Define o usuário atual no contexto do Sentry
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // Não incluir email por questões de privacidade
  });
}

/**
 * Remove o usuário do contexto
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Adiciona breadcrumb (rastro de eventos)
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

/**
 * Inicia uma transação (para performance monitoring)
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    (span) => span,
  );
}
