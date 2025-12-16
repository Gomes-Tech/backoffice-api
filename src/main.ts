import { getEnv } from '@infra/config';
import { HttpExceptionFilter } from '@infra/filters';
import { ShutdownSignal, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import { RequestHandler, json } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setViewEngine('pug');
  app.setBaseViewsDir(join(__dirname, '..', '..', 'templates'));

  app.use((cookieParser as unknown as () => RequestHandler)());
  app.use(json({ limit: '10mb' }));
  app.set('trust proxy', 1);
  app.set('query parser', 'extended');

  // ============================================
  // CRÍTICO: CORS ANTES DE TUDO
  // ============================================
  const normalizeOrigin = (origin: string): string => {
    let normalized = origin.trim().replace(/^["']+|["']+$/g, '');
    normalized = normalized.replace(/\/+$/, '');
    return normalized;
  };

  const rawAllowedOrigins = getEnv().api.allowedOrigins || '';
  const normalizedRawValue = normalizeOrigin(rawAllowedOrigins);

  const allowedOrigins = normalizedRawValue
    ? normalizedRawValue
        .split(',')
        .map(normalizeOrigin)
        .filter((origin) => origin.length > 0)
    : [];

  console.log('🔐 CORS Configuration:', {
    allowedOrigins:
      allowedOrigins.length > 0 ? allowedOrigins : 'ALL (development mode)',
    mode: process.env.NODE_ENV,
  });

  // CORS configurado ANTES de tudo
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Desenvolvimento: permitir tudo se não houver origins configuradas
      if (allowedOrigins.length === 0) {
        if (process.env.NODE_ENV === 'prod') {
          console.warn('⚠️  ALLOWED_ORIGINS não configurado em produção!');
          return callback(null, false);
        }
        console.log('✅ CORS: Allowing all origins (dev mode)');
        return callback(null, true);
      }

      // Verificar origin
      const normalizedRequestOrigin = normalizeOrigin(origin);
      const isAllowed = allowedOrigins.some(
        (allowedOrigin) =>
          allowedOrigin === normalizedRequestOrigin || allowedOrigin === origin,
      );

      if (isAllowed) {
        console.log(`✅ CORS: Allowed origin: ${origin}`);
        return callback(null, true);
      }

      console.warn(`🚫 CORS: Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-Forwarded-For',
      'X-Request-ID',
      'api_key',
    ],
    exposedHeaders: ['X-Token-Expired'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global prefix DEPOIS do CORS
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Backoffice API')
    .setDescription('The Backoffice API for Decoreasy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
    ignoreGlobalPrefix: false,
  });

  if (process.env.NODE_ENV !== 'prod') {
    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: false,
    });
    app.use('/reference', apiReference({ content: document }));
  }

  const PORT = getEnv().api.port;
  const baseUrl = `http://localhost:${PORT}`;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Helmet DEPOIS do CORS e global prefix
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  app.use(compress());

  // Rate limiter não bloqueia OPTIONS
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      skip: (req) => req.method === 'OPTIONS',
    }),
  );

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 Application is running on port ${PORT}  ║
╚════════════════════════════════════════╝
    `);
    console.log(`🌐 API URL: ${baseUrl}/api`);
    console.log(
      `🔐 Allowed Origins: ${allowedOrigins.join(', ') || 'ALL (dev mode)'}`,
    );
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`📗 API Docs: ${baseUrl}/docs`);
      console.log(`📗 API Reference: ${baseUrl}/reference`);
    }
    console.log('');
  });

  app.enableShutdownHooks(Object.values(ShutdownSignal));
}

bootstrap();
