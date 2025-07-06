import {
  ForgotPasswordUseCase,
  RefreshTokenUseCase,
  ResetPasswordUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers';
import { TokenPasswordModule } from './token-password.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),
    UserModule,
    TokenPasswordModule,
  ],
  controllers: [AuthController],
  providers: [
    SignInUserUseCase,
    SignUpUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
})
export class AuthModule {}
