import { HttpExceptionFilter } from '@infra/filters';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
  const port = process.env.PORT || configService.get<number>('PORT') || 3333;

  await app.listen(port, () => {
    console.log(`Application is running on port ${port} 🚀`);
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`📗 API Docs: http://localhost:${port}/docs`);
      console.log(`📗 API Reference: http://localhost:${port}/reference`);
    }
  });
}

bootstrap();
