import {
  ForgotPasswordUseCase,
  RefreshTokenUseCase,
  ResetPasswordUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
import { VerifyTokenPasswordUseCase } from '@app/token-password';
import { Public, Roles } from '@interfaces/http/decorators';
import { CreateUserDto, LoginDTO } from '@interfaces/http/dtos';
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
  async signUp(@Body() dto: CreateUserDto) {
    return await this.signUpUser.execute(dto);
  }

  @Public()
  @Post('/refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.refreshToken.execute(refreshToken);
    return result;
  }

  @Public()
  @Post('/forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return await this.forgotPasswordUseCase.execute(email);
  }

  @Public()
  @Post('/verify-token')
  async verifyToken(@Body() dto: { email: string; token: string }) {
    await this.verifyTokenPasswordUseCase.execute(dto.email, dto.token);
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() dto: { email: string; password: string }) {
    await this.resetPasswordUseCase.execute(dto.email, dto.password);
  }
}
