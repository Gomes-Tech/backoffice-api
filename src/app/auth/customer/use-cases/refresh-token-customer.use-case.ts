import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { FindCustomerByIdUseCase, UpdateCustomerUseCase } from '@app/customer';
import { ReturnCustomer } from '@domain/customer';

@Injectable()
export class RefreshTokenCustomerUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
  ) {}

  async execute(refreshToken: string): Promise<Output> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const customer = await this.findCustomerByIdUseCase.execute(payload.id);

      const accessToken = this.generateToken(customer);

      const newRefreshToken = this.generateRefreshToken(customer);

      await this.updateCustomerUseCase.execute(customer.id, {
        refreshToken: newRefreshToken,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        customer,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado!');
    }
  }

  private generateToken(customer: ReturnCustomer): string {
    const payload = { id: customer.id, email: customer.email };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwt.expires'),
    };

    return this.jwtService.sign(payload, options);
  }

  private generateRefreshToken(customer: ReturnCustomer): string {
    const payload = { id: customer.id, email: customer.email };
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
  customer: ReturnCustomer;
};
