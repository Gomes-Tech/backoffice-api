import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { FindUserByIdUseCase, UpdateUserUseCase, UserMapper } from '@app/user';
import { User } from '@domain/user';
import { UserResponseDTO } from '@interfaces/http';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  async execute(refreshToken: string): Promise<Output> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.findUserByIdUseCase.execute(payload.id);

      const accessToken = this.generateToken(user);

      const newRefreshToken = this.generateRefreshToken(user);

      await this.updateUserUseCase.execute(user.id, {
        refreshToken: newRefreshToken,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: UserMapper.toView(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado!');
    }
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
