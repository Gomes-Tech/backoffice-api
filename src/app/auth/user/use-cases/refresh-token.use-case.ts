import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { FindUserByIdUseCase } from '@app/user';
import { User } from '@domain/user';
import { TokenBlacklistService } from '@infra/security';
import { ADMIN_JWT } from '@interfaces/http/modules/jwt.module';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(ADMIN_JWT)
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async execute(refreshToken: string): Promise<Output> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Verifica se o refresh token está na blacklist
      if (payload.jti) {
        const isBlacklisted =
          await this.tokenBlacklistService.isRefreshTokenBlacklisted(
            payload.jti,
          );
        if (isBlacklisted) {
          throw new UnauthorizedException('Refresh token foi revogado!');
        }
      }

      const user = await this.findUserByIdUseCase.execute(payload.id);

      // Adiciona o refresh token antigo à blacklist
      if (payload.jti) {
        await this.tokenBlacklistService.addRefreshTokenToBlacklist(
          payload.jti,
        );
      }

      const accessToken = this.generateToken(user);

      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado!');
    }
  }

  private generateToken(user: User): string {
    const jti = randomUUID();
    const payload = { id: user.id, email: user.email, role: user.role, jti };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwt.expires'),
    };

    return this.jwtService.sign(payload, options);
  }

  private generateRefreshToken(user: User): string {
    const jti = randomUUID();
    const payload = { id: user.id, email: user.email, role: user.role, jti };
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
};
