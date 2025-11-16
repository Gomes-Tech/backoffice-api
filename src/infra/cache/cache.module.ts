import { CacheModule as Cache } from '@nestjs/cache-manager';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    Cache.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        const useRedis = configService.get('useRedis', 'true') === 'true';

        // Se Redis não estiver habilitado explicitamente, usar cache em memória
        if (!useRedis) {
          Logger.log(
            'Usando cache em memória (USE_REDIS=false)',
            'CacheModule',
          );
          return {
            ttl: redisConfig.ttl * 1000, // TTL em milissegundos
            max: 100, // Limite de itens em memória
          };
        }

        // Tentar usar Redis
        try {
          const redisOptions: any = {
            socket: {
              host: redisConfig.host,
              port: redisConfig.port,
            },
            database: redisConfig.db,
          };

          // Só adiciona password se estiver definido e não vazio
          if (redisConfig.password && redisConfig.password.trim() !== '') {
            redisOptions.password = redisConfig.password;
          }

          Logger.log(
            `Conectando ao Redis em ${redisConfig.host}:${redisConfig.port}`,
            'CacheModule',
          );

          return {
            store: await redisStore(redisOptions),
            ttl: redisConfig.ttl * 1000, // TTL em milissegundos
          };
        } catch (error) {
          Logger.warn(
            'Falha ao conectar ao Redis, usando cache em memória',
            'CacheModule',
          );
          Logger.warn(error.message, 'CacheModule');
          return {
            ttl: redisConfig.ttl * 1000,
            max: 100,
          };
        }
      },
    }),
  ],
  controllers: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
