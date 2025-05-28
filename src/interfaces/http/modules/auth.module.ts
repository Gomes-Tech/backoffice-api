import {
  RefreshTokenUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers';
import { UserModule } from './user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [SignInUserUseCase, SignUpUseCase, RefreshTokenUseCase],
})
export class AuthModule {}
