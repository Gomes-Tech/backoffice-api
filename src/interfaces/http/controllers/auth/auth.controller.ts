import {
  ForgotPasswordUseCase,
  RefreshTokenUseCase,
  ResetPasswordUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
import { VerifyTokenPasswordUseCase } from '@app/token-password';
import { Public, Roles, UserId } from '@interfaces/http/decorators';
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUser: SignInUserUseCase,
    private readonly signUpUser: SignUpUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyTokenPasswordUseCase: VerifyTokenPasswordUseCase,
  ) {}

  @Public()
  @UsePipes(ValidationPipe)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDTO) {
    return await this.signInUser.execute(dto);
  }

  @Roles('admin')
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateUserDto, @UserId() userId: string) {
    return await this.signUpUser.execute(dto, userId);
  }

  @Public()
  @Post('/refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.refreshToken.execute(refreshToken);
    return result;
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
