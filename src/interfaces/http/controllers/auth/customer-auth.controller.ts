import {
  ForgotPasswordCustomerUseCase,
  RefreshTokenCustomerUseCase,
  ResetPasswordCustomerUseCase,
  SignInCustomerUseCase,
  SignUpCustomerUseCase,
} from '@app/auth';
import { VerifyTokenPasswordUseCase } from '@app/token-password';
import { Public } from '@interfaces/http/decorators';
import {
  CreateCustomerDTO,
  ForgotPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
  VerifyTokenDTO,
} from '@interfaces/http/dtos';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly signInCustomerUseCase: SignInCustomerUseCase,
    private readonly signUpCustomerUseCase: SignUpCustomerUseCase,
    private readonly refreshTokenCustomerUseCase: RefreshTokenCustomerUseCase,
    private readonly forgotPasswordCustomerUseCase: ForgotPasswordCustomerUseCase,
    private readonly resetPasswordCustomerUseCase: ResetPasswordCustomerUseCase,
    private readonly verifyTokenPasswordUseCase: VerifyTokenPasswordUseCase,
  ) {}

  @Public()
  @UsePipes(ValidationPipe)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDTO) {
    return await this.signInCustomerUseCase.execute(dto);
  }

  @Public()
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateCustomerDTO) {
    return await this.signUpCustomerUseCase.execute(dto);
  }

  @Public()
  @Post('/refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.refreshTokenCustomerUseCase.execute(refreshToken);
    return result;
  }

  @Public()
  @Post('/forgot-password')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return await this.forgotPasswordCustomerUseCase.execute(dto.email);
  }

  @Public()
  @Post('/verify-token')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() dto: VerifyTokenDTO) {
    await this.verifyTokenPasswordUseCase.execute(dto.email, dto.token);
  }

  @Public()
  @Post('/reset-password')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDTO) {
    await this.resetPasswordCustomerUseCase.execute(dto.email, dto.password);
  }
}
