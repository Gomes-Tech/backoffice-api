import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { FindUserByEmailUseCase } from '@app/user';
import { User } from '@domain/user';
import { CryptographyService } from '@infra/criptography';
import { LoginException } from '@infra/filters';
import { SecurityLoggerService } from '@infra/security';
import { LoginDTO } from '@interfaces/http';
import { ADMIN_JWT } from '@interfaces/http/modules/jwt.module';

@Injectable()
export class SignInUserUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly configService: ConfigService,
    @Inject(ADMIN_JWT)
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
    const userExisting = await this.findUserByEmail
      .execute(dto.email)
      .catch(() => null);

    // Hash dummy para manter tempo de resposta consistente
    // Isso previne timing attacks que poderiam revelar se email existe
    const dummyHash =
      '$2b$10$dummy.hash.to.prevent.timing.attacks.and.enumeration';

    // Sempre fazer comparação de hash, mesmo se usuário não existir
    // Isso garante que o tempo de resposta seja similar em ambos os casos
    const passwordMatch = userExisting
      ? await this.cryptographyService.compare(
          dto.password,
          userExisting.password,
        )
      : await this.cryptographyService.compare(dto.password, dummyHash);

    // Só autenticar se usuário existir E senha estiver correta
    if (!userExisting || !passwordMatch) {
      this.securityLogger.logFailedLogin(
        dto.email,
        ip || 'unknown',
        userAgent,
        'Credenciais inválidas',
      );
      // Sempre retornar a mesma mensagem, não revelando se email existe
      throw new LoginException('E-mail ou senha inválidos!');
    }

    const accessToken = this.generateToken(userExisting);
    const refreshToken = this.generateRefreshToken(userExisting);

    this.securityLogger.logSuccessfulLogin(
      userExisting.id,
      userExisting.email,
      ip || 'unknown',
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateToken(user: User): string {
    const jti = randomUUID();
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      jti,
    };
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
