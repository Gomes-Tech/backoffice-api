import {
  ForgotPasswordUseCase,
  RefreshTokenUseCase,
  ResetPasswordUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
import { VerifyTokenPasswordUseCase } from '@app/token-password';
import { UnauthorizedException } from '@infra/filters';
import { AuthType, Public, Roles, UserId } from '@interfaces/http/decorators';
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
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyTokenPasswordUseCase: VerifyTokenPasswordUseCase,
  ) {}

  @Public()
  @UsePipes(ValidationPipe)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.signInUser.execute(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
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
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    // Chama o use case passando o refreshToken
    const { accessToken, refreshToken: newRefreshToken } =
      await this.refreshTokenUseCase.execute(refreshToken);

    // Atualiza os cookies HttpOnly
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
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
  async logout(@Res({ passthrough: true }) res: Response) {
    // Remove os cookies
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 0, // expira imediatamente
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod',
      sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
      path: '/',
      maxAge: 0, // expira imediatamente
    });

    return { success: true };
  }

  @Public()
  @Post('/forgot-password')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return await this.forgotPasswordUseCase.execute(dto.email);
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
    await this.resetPasswordUseCase.execute(dto.email, dto.password);
  }
}
