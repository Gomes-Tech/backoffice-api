import {
  ForgotPasswordCustomerUseCase,
  ForgotPasswordUseCase,
  RefreshTokenCustomerUseCase,
  RefreshTokenUseCase,
  ResetPasswordCustomerUseCase,
  ResetPasswordUseCase,
  SignInCustomerUseCase,
  SignInUserUseCase,
  SignUpCustomerUseCase,
  SignUpUseCase,
} from '@app/auth';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController, CustomerAuthController } from '../controllers';
import { CustomerModule } from './customer.module';
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
    CustomerModule,
    TokenPasswordModule,
  ],
  controllers: [AuthController, CustomerAuthController],
  providers: [
    SignInUserUseCase,
    SignUpUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    SignInCustomerUseCase,
    SignUpCustomerUseCase,
    RefreshTokenCustomerUseCase,
    ForgotPasswordCustomerUseCase,
    ResetPasswordCustomerUseCase,
  ],
})
export class AuthModule {}
