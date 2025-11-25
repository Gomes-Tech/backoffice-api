import { getEnv } from '@infra/config';
import { HttpExceptionFilter } from '@infra/filters';
import { ShutdownSignal, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import { json, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setViewEngine('pug');
  app.setBaseViewsDir(join(__dirname, '..', '..', 'templates'));

  app.setGlobalPrefix('api');
  app.set('query parser', 'extended');

  app.use((cookieParser as unknown as () => RequestHandler)());

  app.use(json({ limit: '10mb' }));

  app.set('trust proxy', 1);

  const config = new DocumentBuilder()
    .setTitle('Backoffice API')
    .setDescription('The Backoffice API for Decoreasy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // Isso faz o Swagger usar /api como prefixo nas rotas
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
    ignoreGlobalPrefix: false,
  });

  if (process.env.NODE_ENV !== 'prod') {
    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: false, // Mostra rotas completas com /api no Swagger
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

  // Configuração de CORS
  const allowedOrigins = getEnv().api.allowedOrigins
    ? getEnv()
        .api.allowedOrigins.split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : [];

  // Configurar Helmet ANTES do CORS para não interferir
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (ex: mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Se não houver origens configuradas, permitir todas (apenas em dev)
      if (allowedOrigins.length === 0) {
        if (process.env.NODE_ENV === 'prod') {
          console.warn(
            '⚠️  ALLOWED_ORIGINS não configurado em produção! CORS pode falhar.',
          );
          return callback(null, false);
        }
        return callback(null, true);
      }

      // Verificar se a origin está na lista permitida
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log para debug em produção
      if (process.env.NODE_ENV === 'prod') {
        console.warn(`🚫 Origin bloqueada: ${origin}`);
        console.log(`✅ Origens permitidas: ${allowedOrigins.join(', ')}`);
      }

      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'DELETE', 'PUT'],
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
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.use(compress());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
    }),
  );

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT} 🚀`);
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`📗 API Docs: ${baseUrl}/docs`);
      console.log(`📗 API Reference: ${baseUrl}/reference`);
    }
  });

  app.enableShutdownHooks(Object.values(ShutdownSignal));
}

bootstrap();
