import {
  RefreshTokenUseCase,
  SignInUserUseCase,
  SignUpUseCase,
} from '@app/auth';
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
@Public()
export class AuthController {
  constructor(
    private readonly signInUser: SignInUserUseCase,
    private readonly signUpUser: SignUpUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
  ) {}

  @UsePipes(ValidationPipe)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDTO) {
    return await this.signInUser.execute(dto);
  }

  @Roles('admin')
  @UsePipes(ValidationPipe)
  @Post('/sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateUserDto) {
    return await this.signUpUser.execute(dto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const result = await this.refreshToken.execute(refreshToken);
    return result;
  }
}
