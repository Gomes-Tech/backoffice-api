import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { FindCustomerByEmailUseCase } from '@app/customer';
import { ReturnCustomer } from '@domain/customer';
import { CryptographyService } from '@infra/criptography';
import { LoginException } from '@infra/filters';
import { LoginDTO } from '@interfaces/http';
import { CLIENT_JWT } from '@interfaces/http/modules/jwt.module';

@Injectable()
export class SignInCustomerUseCase {
  constructor(
    private readonly findCustomerByEmailUseCase: FindCustomerByEmailUseCase,
    private readonly configService: ConfigService,
    @Inject(CLIENT_JWT)
    private readonly jwtService: JwtService,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(dto: LoginDTO): Promise<Output> {
    const customerExisting = await this.findCustomerByEmailUseCase
      .execute(dto.email)
      .catch(() => null);

    if (
      !customerExisting ||
      !(await this.cryptographyService.compare(
        dto.password,
        customerExisting?.password,
      ))
    ) {
      throw new LoginException('E-mail ou senha inválidos!');
    }

    const accessToken = this.generateToken(customerExisting);
    const refreshToken = this.generateRefreshToken(customerExisting);

    return {
      accessToken,
      refreshToken,
      customer: customerExisting,
    };
  }

  private generateToken(customer: ReturnCustomer): string {
    const payload = { id: customer.id, email: customer.email };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>('jwtCustomer.expires'),
    };

    return this.jwtService.sign(payload, options);
  }

  private generateRefreshToken(customer: ReturnCustomer): string {
    const payload = { id: customer.id, email: customer.email };
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
  customer: ReturnCustomer;
};
