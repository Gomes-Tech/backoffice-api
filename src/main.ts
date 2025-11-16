import { HttpExceptionFilter } from '@infra/filters';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { json, RequestHandler } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Função para inicializar a aplicação
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.set('query parser', 'extended');

  app.use((cookieParser as unknown as () => RequestHandler)());

  app.use(json({ limit: '10mb' }));

  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 segundos
    res.setTimeout(30000);
    next();
  });

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

  if (process.env.NODE_ENV === 'prod') {
    app.use(csurf({ cookie: true }));
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

  // AuthServerGuard será aplicado via APP_GUARD no AppModule
  // Não precisa ser aplicado aqui também, pois já está no AuthDispatchGuard

  // Configuração do Helmet com headers de segurança
  const helmetConfig: Parameters<typeof helmet>[0] = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Se usar recursos externos
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Headers de segurança adicionais
    xContentTypeOptions: true, // X-Content-Type-Options: nosniff
    xFrameOptions: { action: 'deny' }, // X-Frame-Options: DENY
    xXssProtection: true, // X-XSS-Protection: 1; mode=block
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Referrer-Policy
    // HSTS (HTTP Strict Transport Security) - apenas em produção com HTTPS
    ...(process.env.NODE_ENV === 'prod' && {
      strictTransportSecurity: {
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true,
      },
    }),
  };

  app.use(helmet(helmetConfig));

  // Permissions-Policy header (não suportado diretamente pelo Helmet v8)
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    );
    next();
  });

  // Compressão de respostas HTTP
  app.use(
    compression({
      filter: (req, res) => {
        // Não comprime se o header 'x-no-compression' estiver presente
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Comprime apenas respostas textuais e JSON
        const contentType = res.getHeader('content-type') as string;
        if (contentType) {
          return (
            contentType.includes('text/') ||
            contentType.includes('application/json') ||
            contentType.includes('application/javascript') ||
            contentType.includes('application/xml')
          );
        }
        return true;
      },
      // Nível de compressão (0-9, onde 9 é máxima compressão)
      // 6 é um bom equilíbrio entre compressão e velocidade
      level: 6,
      // Threshold mínimo em bytes para comprimir (padrão: 1KB)
      threshold: 1024,
    }),
  );

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const configService = app.get(ConfigService);

  // Configuração CORS dinâmica
  const corsConfig = configService.get<{ allowedOrigins: string[] }>('cors');
  const allowedOrigins = corsConfig?.allowedOrigins || [];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: Postman, mobile apps)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Permite localhost em desenvolvimento
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        callback(null, true);
        return;
      }

      // Verifica se a origin está na lista permitida
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Se não houver origens configuradas e não for localhost, permite (fallback para desenvolvimento)
      if (allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }

      // Rejeita origem não autorizada
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'api_key', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || configService.get<number>('PORT') || 3333;

  await app.listen(port, () => {
    console.log(`Application is running on port ${port} 🚀`);
    if (process.env.NODE_ENV !== 'prod') {
      console.log(`📗 API Docs: http://localhost:${port}/docs`);
      console.log(`📗 API Reference: http://localhost:${port}/reference`);
    }
  });

  // Configuração de Graceful Shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Recebido sinal ${signal}. Iniciando graceful shutdown...`);

    try {
      const server = app.getHttpServer();
      const shutdownTimeout = 30000; // 30 segundos

      // Para de aceitar novas requisições e aguarda requisições em andamento
      const closeServer = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              reject(err);
            } else {
              console.log('✅ Servidor HTTP parou de aceitar novas requisições.');
              resolve();
            }
          });
        });
      };

      // Fecha a aplicação NestJS (fecha módulos, conexões, etc.)
      const closeApp = (): Promise<void> => {
        return app.close();
      };

      // Executa shutdown com timeout
      const shutdownWithTimeout = async () => {
        const timeoutId = setTimeout(() => {
          console.log('⚠️  Timeout de shutdown atingido. Forçando encerramento...');
          process.exit(1);
        }, shutdownTimeout);

        try {
          await closeServer();
          console.log('⏳ Aguardando requisições em andamento terminarem...');
          await closeApp();
          clearTimeout(timeoutId);
          console.log('✅ Conexões fechadas com sucesso.');
          console.log('👋 Aplicação encerrada graciosamente.');
          process.exit(0);
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      await shutdownWithTimeout();
    } catch (error) {
      console.error('❌ Erro durante graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Registra handlers para sinais de encerramento
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handler para erros não tratados
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('❌ Unhandled Rejection:', reason);
    // Não encerra o processo imediatamente, apenas registra o erro
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
}

bootstrap();
