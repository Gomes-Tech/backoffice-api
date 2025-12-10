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
  CartModule,
  CategoryFAQModule,
  CategoryModule,
  CouponModule,
  CustomerModule,
  FooterMenuModule,
  HeaderMenuModule,
  HealthModule,
  JwtModule,
  ProductFAQModule,
  ProductModule,
  RelatedProductModule,
  RoleModule,
  SimilarProductModule,
  SocialMediaModule,
  TokenPasswordModule,
  UserModule,
  WishlistModule,
} from '@interfaces/http/modules';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  CacheModule,
  CircuitBreakerModule,
  ConfigModule,
  CryptographyModule,
  MailModule,
  MetricsInterceptor,
  MetricsModule,
  PrismaModule,
  SecurityModule,
  StorageModule,
  ThrottlerConfigModule,
} from './infra';
import {
  FileSizeValidationInterceptor,
  RequestIdInterceptor,
} from './shared/interceptors';
@Module({
  imports: [
    JwtModule,
    MetricsModule,
    CacheModule,
    CircuitBreakerModule,
    MailModule,
    ConfigModule,
    PrismaModule,
    TokenPasswordModule,
    CryptographyModule,
    StorageModule,
    SecurityModule,
    ThrottlerConfigModule,
    HealthModule,
    AuthModule,
    CartModule,
    CouponModule,
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
    WishlistModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FileSizeValidationInterceptor,
    },
  ],
})
export class AppModule {}
