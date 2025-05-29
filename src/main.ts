import { HttpExceptionFilter } from '@infra/filters';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.use(helmet());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  await app.listen(port, () => Logger.log(`http://localhost:${port}`));
}

bootstrap();
