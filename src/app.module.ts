import { AuthGuard, CustomerAuthGuard, RolesGuard } from '@interfaces/http';
import { AuthDispatchGuard } from '@interfaces/http/guards/auth.guard';
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
import { JwtModule } from '@interfaces/http/modules/jwt.module';
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
    HeaderMenuModule,
    SocialMediaModule,
    FooterMenuModule,
    RoleModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CustomerAuthGuard,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthDispatchGuard,
    },
  ],
})
export class AppModule {}
