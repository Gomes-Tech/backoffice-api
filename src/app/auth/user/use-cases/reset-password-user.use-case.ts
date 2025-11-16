import { UpdateTokenPasswordUseCase } from '@app/token-password';
import { FindUserByEmailUseCase, UpdateUserUseCase } from '@app/user';
import { SecurityLoggerService } from '@infra/security';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateTokenPasswordUseCase: UpdateTokenPasswordUseCase,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  async execute(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ) {
    try {
      const user = await this.findUserByEmailUseCase.execute(email);

      await this.updateUserUseCase.execute(user.id, {
        password,
      });

      await this.updateTokenPasswordUseCase.execute(user.email);

      this.securityLogger.logPasswordResetAttempt(
        email,
        ip || 'unknown',
        true,
        userAgent,
      );
    } catch (error) {
      this.securityLogger.logPasswordResetAttempt(
        email,
        ip || 'unknown',
        false,
        userAgent,
      );
      throw error;
    }
  }
}
