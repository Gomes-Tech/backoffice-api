import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { FindUserByEmailUseCase, UserMapper } from '@app/user';
import { User } from '@domain/user';
import { CryptographyService } from '@infra/criptography';
import { LoginException } from '@infra/filters';
import { LoginDTO, UserResponseDTO } from '@interfaces/http';

@Injectable()
export class SignInUserUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(dto: LoginDTO): Promise<Output> {
    const userExisting = await this.findUserByEmail
      .execute(dto.email)
      .catch(() => null);

    if (
      !userExisting ||
      !(await this.cryptographyService.compare(
        dto.password,
        userExisting?.password,
      ))
    ) {
      throw new LoginException('E-mail ou senha inválidos!');
    }

    const accessToken = this.generateToken(userExisting);
    const refreshToken = this.generateRefreshToken(userExisting);

    return {
      accessToken,
      refreshToken,
      user: UserMapper.toView(userExisting),
    };
  }

  private generateToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwt.expires'),
    };

    return this.jwtService.sign(payload, options);
  }

  private generateRefreshToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwt.refreshExpires'),
      secret: this.configService.get<string>('jwt.refreshSecret'),
    };

    return this.jwtService.sign(payload, options);
  }
}

type Output = {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDTO;
};
