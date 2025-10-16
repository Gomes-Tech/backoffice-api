import { HttpExceptionFilter } from '@infra/filters';
import {
  AdvancedLoggerService,
  CustomLoggerService,
  LoggingInterceptor,
  initializeSentry,
} from '@infra/logger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Inicializa o Sentry antes de tudo
initializeSentry();

// Função para inicializar a aplicação
async function bootstrap() {
  const logger = new CustomLoggerService();
  logger.setContext('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  // Obtém o interceptor de logging do container de injeção de dependências
  if (process.env.NODE_ENV === 'development') {
    const logger = app.get(AdvancedLoggerService);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
  }

  app.setGlobalPrefix('api');
  app.set('query parser', 'extended');

  app.use(cookieParser());

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

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://api.cron-job.org/',
        'https://decoreasy.vercel.app',
        'https://backoffice-eta-seven.vercel.app',
        'https://s5dhcf9x-3000.brs.devtunnels.ms',
      ];

      if (
        !origin ||
        origin.startsWith('http://localhost') ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  app.use(helmet());

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3333;

  await app.listen(port, () => {
    logger.log(`Application is running on port ${port} 🚀`);
    if (process.env.NODE_ENV !== 'prod') {
      logger.log(`📗 API Docs: http://localhost:${port}/docs`);
      logger.log(`📗 API Reference: http://localhost:${port}/reference`);
    }
  });
}

bootstrap();
