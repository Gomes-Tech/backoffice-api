import { AuthGuard, CustomerAuthGuard, RolesGuard } from '@interfaces/http';
import {
  AttributeModule,
  AttributeValueModule,
  AuthModule,
  BannerModule,
  CategoryModule,
  CustomerModule,
  FooterMenuModule,
  HeaderMenuModule,
  ProductModule,
  RoleModule,
  SocialMediaModule,
  UserModule,
} from '@interfaces/http/modules';
import { TokenPasswordModule } from '@interfaces/http/modules/token-password.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  CacheModule,
  ConfigModule,
  CryptographyModule,
  MailModule,
  PrismaModule,
  StorageModule,
} from './infra';

@Module({
  imports: [
    CacheModule,
    MailModule,
    ConfigModule,
    PrismaModule,
    TokenPasswordModule,
    CryptographyModule,
    StorageModule,
    AuthModule,
    AttributeModule,
    AttributeValueModule,
    BannerModule,
    UserModule,
    CustomerModule,
    CategoryModule,
    HeaderMenuModule,
    SocialMediaModule,
    FooterMenuModule,
    RoleModule,
    ProductModule,
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
      useClass: CustomerAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
