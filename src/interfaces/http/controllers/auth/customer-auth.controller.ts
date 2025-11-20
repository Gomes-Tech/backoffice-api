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
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

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
  async signIn(
    @Body() dto: LoginDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const { accessToken, refreshToken } =
      await this.signInCustomerUseCase.execute(dto, ip, userAgent);

    res.cookie('customerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.cookie('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
  }

  @Public()
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() dto: CreateCustomerDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.signUpCustomerUseCase.execute(dto);

    res.cookie('customerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.cookie('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
  }

  @Public()
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // Pega o refreshToken do cookie HttpOnly
    const refreshToken = req.cookies?.['customerRefreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    // Chama o use case passando o refreshToken
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenCustomerUseCase.execute(refreshToken);

    // Atualiza os cookies HttpOnly
    res.cookie('customerAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('customerRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return { success: true }; // ou algum status, você não precisa retornar os tokens no JSON
  }

  @Public()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Obtém os tokens dos cookies antes de removê-los
    const accessToken = req.cookies?.['customerAccessToken'];
    const refreshToken = req.cookies?.['customerRefreshToken'];

    // Blacklista os tokens
    await this.logoutCustomerUseCase.execute(accessToken, refreshToken);

    // Remove os cookies
    res.cookie('customerAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 0, // expira imediatamente
    });

    res.cookie('customerRefreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 0, // expira imediatamente
    });

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
