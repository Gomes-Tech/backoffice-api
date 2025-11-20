import {
  ForgotPasswordUseCase,
  LogoutUserUseCase,
  RefreshTokenUseCase,
  ResetPasswordUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
import { VerifyTokenPasswordUseCase } from '@app/token-password';
import { UnauthorizedException } from '@infra/filters';
import {
  AuthType,
  Public,
  Roles,
  ThrottleLogin,
  ThrottlePasswordReset,
  ThrottleTokenGeneration,
  UserId,
} from '@interfaces/http/decorators';
import {
  CreateUserDto,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUser: SignInUserUseCase,
    private readonly signUpUser: SignUpUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
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
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const { accessToken, refreshToken } = await this.signInUser.execute(
      dto,
      ip,
      userAgent,
    );

    res.cookie('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.cookie('adminAuthenticated', 'true', {
      httpOnly: false, // Permite acesso via JavaScript no frontend
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
  }

  @Roles('admin')
  @AuthType(['user'])
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateUserDto, @UserId() userId: string) {
    return await this.signUpUser.execute(dto, userId);
  }

  @Public()
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Pega o refreshToken do cookie HttpOnly
    const refreshToken = req.cookies?.['adminRefreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    // Chama o use case passando o refreshToken
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenUseCase.execute(refreshToken);

    // Atualiza os cookies HttpOnly
    res.cookie('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('adminRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.cookie('adminAuthenticated', 'true', {
      httpOnly: false, // Permite acesso via JavaScript no frontend
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return { success: true };
  }

  @Public()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Obtém os tokens dos cookies antes de removê-los
    const accessToken = req.cookies?.['adminAccessToken'];
    const refreshToken = req.cookies?.['adminRefreshToken'];

    // Blacklista os tokens
    await this.logoutUserUseCase.execute(accessToken, refreshToken);

    // Remove os cookies
    res.cookie('adminAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 0, // expira imediatamente
    });

    res.cookie('adminRefreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 0, // expira imediatamente
    });

    res.cookie('adminAuthenticated', '', {
      httpOnly: false,
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
    return await this.forgotPasswordUseCase.execute(dto.email);
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
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    await this.resetPasswordUseCase.execute(
      dto.email,
      dto.password,
      ip,
      userAgent,
    );
  }
}
