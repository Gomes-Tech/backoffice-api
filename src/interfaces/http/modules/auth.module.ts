import {
  ForgotPasswordCustomerUseCase,
  ForgotPasswordUseCase,
  LogoutCustomerUseCase,
  LogoutUserUseCase,
  RefreshTokenCustomerUseCase,
  RefreshTokenUseCase,
  ResetPasswordCustomerUseCase,
  ResetPasswordUseCase,
  SignInCustomerUseCase,
  SignInUserUseCase,
  SignUpCustomerUseCase,
  SignUpUseCase,
} from '@app/auth';
import { SecurityModule } from '@infra/security';
import { Module } from '@nestjs/common';
import { AuthController, CustomerAuthController } from '../controllers';
import { CustomerModule } from './customer.module';
import { JwtModule } from './jwt.module';
import { TokenPasswordModule } from './token-password.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    JwtModule,
    UserModule,
    CustomerModule,
    TokenPasswordModule,
    SecurityModule,
  ],
  controllers: [AuthController, CustomerAuthController],
  providers: [
    SignInUserUseCase,
    SignUpUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    SignInCustomerUseCase,
    SignUpCustomerUseCase,
    RefreshTokenCustomerUseCase,
    LogoutCustomerUseCase,
    ForgotPasswordCustomerUseCase,
    ResetPasswordCustomerUseCase,
  ],
})
export class AuthModule {}
