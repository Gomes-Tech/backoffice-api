import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { FindCustomerByIdUseCase, UpdateCustomerUseCase } from '@app/customer';
import { ReturnCustomer } from '@domain/customer';
import { TokenBlacklistService } from '@infra/security';
import { CLIENT_JWT } from '@interfaces/http/modules/jwt.module';

@Injectable()
export class RefreshTokenCustomerUseCase {
  constructor(
    @Inject(CLIENT_JWT)
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async execute(refreshToken: string): Promise<Output> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwtCustomer.refreshSecret'),
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

      const customer = await this.findCustomerByIdUseCase.execute(payload.id);

      // Adiciona o refresh token antigo à blacklist
      if (payload.jti) {
        await this.tokenBlacklistService.addRefreshTokenToBlacklist(
          payload.jti,
        );
      }

      const accessToken = this.generateToken(customer);

      const newRefreshToken = this.generateRefreshToken(customer);

      await this.updateCustomerUseCase.execute(customer.id, {
        refreshToken: newRefreshToken,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado!');
    }
  }

  private generateToken(customer: ReturnCustomer): string {
    const jti = randomUUID();
    const payload = { id: customer.id, email: customer.email, jti };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwtCustomer.expires'),
    };

    return this.jwtService.sign(payload, options);
  }

  private generateRefreshToken(customer: ReturnCustomer): string {
    const jti = randomUUID();
    const payload = { id: customer.id, email: customer.email, jti };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwtCustomer.refreshExpires'),
      secret: this.configService.get<string>('jwtCustomer.refreshSecret'),
    };

    return this.jwtService.sign(payload, options);
  }
}

type Output = {
  accessToken: string;
  refreshToken: string;
};
