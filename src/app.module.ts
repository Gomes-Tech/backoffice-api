import { AuthGuard, RolesGuard } from '@interfaces/http';
import {
  AuthModule,
  CategoryModule,
  HeaderMenuModule,
  UserModule,
} from '@interfaces/http/modules';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
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
    JwtModule,
    PrismaModule,
    CryptographyModule,
    StorageModule,
    AuthModule,
    UserModule,
    CategoryModule,
    HeaderMenuModule,
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
