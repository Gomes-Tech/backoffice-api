import { AuthGuard, RolesGuard } from '@interfaces/http';
import {
  AuthModule,
  CategoryModule,
  HeaderMenuModule,
  SocialMediaModule,
  UserModule,
} from '@interfaces/http/modules';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ConfigModule,
  CryptographyModule,
  PrismaModule,
  StorageModule,
} from './infra';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CryptographyModule,
    StorageModule,
    AuthModule,
    UserModule,
    CategoryModule,
    HeaderMenuModule,
    SocialMediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
