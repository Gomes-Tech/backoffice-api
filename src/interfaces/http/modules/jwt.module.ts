import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const ADMIN_JWT = 'ADMIN_JWT';
export const CLIENT_JWT = 'CLIENT_JWT';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: ADMIN_JWT,
      useFactory: () =>
        new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRES },
        }),
    },
    {
      provide: CLIENT_JWT,
      useFactory: () =>
        new JwtService({
          secret: process.env.JWT_CUSTOMER_SECRET,
          signOptions: { expiresIn: process.env.JWT_CUSTOMER_EXPIRES },
        }),
    },
  ],
  exports: [ADMIN_JWT, CLIENT_JWT],
})
export class JwtModule {}
