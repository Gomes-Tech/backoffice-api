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
import { AuthController, CustomerAuthController } from '../controllers';
import { CustomerModule } from './customer.module';
import { JwtModule } from './jwt.module';
import { TokenPasswordModule } from './token-password.module';
import { UserModule } from './user.module';

@Module({
  imports: [JwtModule, UserModule, CustomerModule, TokenPasswordModule],
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
