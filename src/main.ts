import { HttpExceptionFilter } from '@infra/filters';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module'; // Caminho ajustado com ./

// Instância do Express para reutilização
const server = express();

// Função para inicializar a aplicação
async function bootstrap() {
  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn', 'log'] },
    );

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.enableCors({
      origin: [
        'https://backoffice-eta-seven.vercel.app/',
        'http://localhost:3333',
      ],
      methods: 'GET,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true,
    });
    app.use(helmet());

    // Configuração do Swagger apenas para ambiente de desenvolvimento
    // if (process.env.NODE_ENV !== 'production') {
    //   const config = new DocumentBuilder()
    //     .setTitle('Documentação com Swagger - Rivera Admin API')
    //     .setVersion('1.0')
    //     .addTag('users')
    //     .build();

    //   const document = SwaggerModule.createDocument(app, config);
    //   SwaggerModule.setup('api', app, document);
    // }

    await app.init();
    return app;
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

let app: any;

// Handler para ambiente serverless (Vercel)
export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      app = await bootstrap();
    }
    server(req, res);
  } catch (error) {
    console.error('Request handler error:', error);
    res
      .status(500)
      .send('Internal Server Error: ' + (error.message || 'Unknown error'));
  }
}

// Inicialização para ambiente de desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  bootstrap()
    .then((app) => {
      const configService = app.get<ConfigService>(ConfigService);
      const port = configService.get<number>('PORT') || 3000;

      app.listen(port, () =>
        Logger.log(`http://localhost:${port} - SERVER RUNNING`),
      );
    })
    .catch((err) => {
      Logger.error(`Error starting server: ${err}`);
    });
}
