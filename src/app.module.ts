import {
  AuthDispatchGuard,
  AuthGuard,
  AuthServerGuard,
  CustomerAuthGuard,
  RolesGuard,
} from '@interfaces/http';
import {
  AttributeModule,
  AttributeValueModule,
  AuthModule,
  BannerModule,
  CategoryFAQModule,
  CategoryModule,
  CustomerModule,
  FooterMenuModule,
  HeaderMenuModule,
  JwtModule,
  ProductFAQModule,
  ProductModule,
  RelatedProductModule,
  RoleModule,
  SimilarProductModule,
  SocialMediaModule,
  TokenPasswordModule,
  UserModule,
} from '@interfaces/http/modules';
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
    JwtModule,
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
    CategoryFAQModule,
    HeaderMenuModule,
    SocialMediaModule,
    FooterMenuModule,
    RoleModule,
    ProductModule,
    RelatedProductModule,
    SimilarProductModule,
    ProductFAQModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CustomerAuthGuard,
    AuthGuard,
    RolesGuard,
    AuthServerGuard,
    {
      provide: APP_GUARD,
      useClass: AuthDispatchGuard,
    },
  ],
})
export class AppModule {}
