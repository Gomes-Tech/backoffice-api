import { HttpExceptionFilter } from '@infra/filters';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Backoffice API')
    .setDescription('The Backoffice API for Decoreasy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // Isso faz o Swagger usar /api como prefixo nas rotas
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    ignoreGlobalPrefix: false,
  });

  if (process.env.NODE_ENV !== 'production') {
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
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://decoreasy.vercel.app',
        'https://backoffice-eta-seven.vercel.app',
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
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(helmet());

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3333;

  await app.listen(port, () => {
    Logger.log(`http://localhost:${port}`);
    if (process.env.NODE_ENV !== 'production') {
      Logger.log(`📗 API Reference: http://localhost:${port}/reference`);
    }
  });
}

bootstrap();
