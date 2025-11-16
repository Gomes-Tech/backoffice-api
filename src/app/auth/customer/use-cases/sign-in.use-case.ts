import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { FindCustomerByEmailUseCase } from '@app/customer';
import { ReturnCustomer } from '@domain/customer';
import { CryptographyService } from '@infra/criptography';
import { LoginException } from '@infra/filters';
import { SecurityLoggerService } from '@infra/security';
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
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  async execute(
    dto: LoginDTO,
    ip?: string,
    userAgent?: string,
  ): Promise<Output> {
    // Proteção contra Enumeration Attack:
    // Sempre fazer verificação de senha, mesmo se email não existir
    // Isso previne timing attacks que poderiam revelar se email existe
    const customerExisting = await this.findCustomerByEmailUseCase
      .execute(dto.email)
      .catch(() => null);

    // Hash dummy para manter tempo de resposta consistente
    // Isso previne timing attacks que poderiam revelar se email existe
    const dummyHash =
      '$2b$10$dummy.hash.to.prevent.timing.attacks.and.enumeration';

    // Sempre fazer comparação de hash, mesmo se customer não existir
    // Isso garante que o tempo de resposta seja similar em ambos os casos
    const passwordMatch = customerExisting
      ? await this.cryptographyService.compare(
          dto.password,
          customerExisting.password,
        )
      : await this.cryptographyService.compare(dto.password, dummyHash);

    // Só autenticar se customer existir E senha estiver correta
    if (!customerExisting || !passwordMatch) {
      this.securityLogger.logFailedLogin(
        dto.email,
        ip || 'unknown',
        userAgent,
        'Credenciais inválidas',
      );
      // Sempre retornar a mesma mensagem, não revelando se email existe
      throw new LoginException('E-mail ou senha inválidos!');
    }

    const accessToken = this.generateToken(customerExisting);
    const refreshToken = this.generateRefreshToken(customerExisting);

    this.securityLogger.logSuccessfulLogin(
      customerExisting.id,
      customerExisting.email,
      ip || 'unknown',
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
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
  // customer: ReturnCustomer;
};
