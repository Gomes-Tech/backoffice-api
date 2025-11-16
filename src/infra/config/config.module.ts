import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        () => ({
          jwt: {
            secret: process.env.JWT_SECRET,
            expires: process.env.JWT_EXPIRES,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            refreshExpires: process.env.JWT_REFRESH_EXPIRES,
          },
          jwtCustomer: {
            secret: process.env.JWT_CUSTOMER_SECRET,
            expires: process.env.JWT_CUSTOMER_EXPIRES,
            refreshSecret: process.env.JWT_CUSTOMER_REFRESH_SECRET,
            refreshExpires: process.env.JWT_CUSTOMER_REFRESH_EXPIRES,
          },
          port: Number(process.env.PORT || '3000'),
          databaseUrl: process.env.DATABASE_URL,
          supabase: {
            url: process.env.SUPABASE_URL,
            apiKey: process.env.SUPABASE_API_KEY,
          },
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: Number(process.env.REDIS_DB || '0'),
            ttl: Number(process.env.REDIS_TTL || '3600'),
          },
          useRedis: process.env.USE_REDIS || 'true',
          cors: {
            allowedOrigins: process.env.ALLOWED_ORIGINS
              ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
              : [],
          },
        }),
      ],
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRES: Joi.string().required(),
        PORT: Joi.number().default(3333),
        DATABASE_URL: Joi.string().uri().required(),
        JWT_CUSTOMER_SECRET: Joi.string().required(),
        JWT_CUSTOMER_EXPIRES: Joi.string().required(),
        JWT_CUSTOMER_REFRESH_SECRET: Joi.string().required(),
        JWT_CUSTOMER_REFRESH_EXPIRES: Joi.string().required(),
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_API_KEY: Joi.string().required(),
        SERVER_AUTH_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        REDIS_DB: Joi.number().default(0),
        REDIS_TTL: Joi.number().default(3600),
        USE_REDIS: Joi.string().valid('true', 'false').default('true'),
        ALLOWED_ORIGINS: Joi.string().optional(),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
