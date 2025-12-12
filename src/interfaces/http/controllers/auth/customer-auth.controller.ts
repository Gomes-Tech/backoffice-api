import {
  ForgotPasswordCustomerUseCase,
  LogoutCustomerUseCase,
  RefreshTokenCustomerUseCase,
  ResetPasswordCustomerUseCase,
  SignInCustomerUseCase,
  SignUpCustomerUseCase,
} from '@app/auth';
import { VerifyTokenPasswordUseCase } from '@app/token-password';
import { UnauthorizedException } from '@infra/filters';
import {
  Public,
  ThrottleLogin,
  ThrottlePasswordReset,
  ThrottleTokenGeneration,
} from '@interfaces/http/decorators';
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
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly signInCustomerUseCase: SignInCustomerUseCase,
    private readonly signUpCustomerUseCase: SignUpCustomerUseCase,
    private readonly refreshTokenCustomerUseCase: RefreshTokenCustomerUseCase,
    private readonly logoutCustomerUseCase: LogoutCustomerUseCase,
    private readonly forgotPasswordCustomerUseCase: ForgotPasswordCustomerUseCase,
    private readonly resetPasswordCustomerUseCase: ResetPasswordCustomerUseCase,
    private readonly verifyTokenPasswordUseCase: VerifyTokenPasswordUseCase,
  ) {}

  @Public()
  @ThrottleLogin()
  @UsePipes(ValidationPipe)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDTO, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const { accessToken, refreshToken, user } =
      await this.signInCustomerUseCase.execute(dto, ip, userAgent);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Public()
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateCustomerDTO) {
    const { accessToken, refreshToken, user } =
      await this.signUpCustomerUseCase.execute(dto);

    return { accessToken, refreshToken, user };
  }

  @Public()
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: { refreshToken: string }) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenCustomerUseCase.execute(dto.refreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  @Public()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Body() dto: { refreshToken: string }) {
    const [_, token] = req.headers.authorization?.split(' ') ?? [];

    // Blacklista os tokens
    await this.logoutCustomerUseCase.execute(token, dto.refreshToken);

    return { success: true };
  }

  @Public()
  @ThrottleTokenGeneration()
  @Post('/forgot-password')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return await this.forgotPasswordCustomerUseCase.execute(dto.email);
  }

  @Public()
  @ThrottleTokenGeneration()
  @Post('/verify-token')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() dto: VerifyTokenDTO) {
    await this.verifyTokenPasswordUseCase.execute(dto.email, dto.token);
  }

  @Public()
  @ThrottlePasswordReset()
  @Post('/reset-password')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDTO, @Req() req: Request) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    await this.resetPasswordCustomerUseCase.execute(
      dto.email,
      dto.password,
      ip,
      userAgent,
    );
  }
}
