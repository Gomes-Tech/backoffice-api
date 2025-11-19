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
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  app.setGlobalPrefix('api');
  app.set('query parser', 'extended');

  app.use((cookieParser as unknown as () => RequestHandler)());

  app.use(json({ limit: '10mb' }));

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

  const PORT = getEnv().api.port
  const baseUrl = `http://localhost:${PORT}`

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


  app.use(helmet());
  app.use(
    compress(),
  );
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100
    })
  )

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(PORT, () => {
    console.log(`Application is running on port ${PORT} 🚀`);
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`📗 API Docs: ${baseUrl}/docs`);
      console.log(`📗 API Reference: ${baseUrl}/reference`);
    }
  });

  app.enableShutdownHooks(Object.values(ShutdownSignal))
}

bootstrap();
