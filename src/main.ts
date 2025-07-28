import { HttpExceptionFilter } from '@infra/filters';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
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

  await app.listen(port, () => Logger.log(`http://localhost:${port}`));
}

bootstrap();
