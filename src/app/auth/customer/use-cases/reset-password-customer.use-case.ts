import {
  FindCustomerByEmailUseCase,
  UpdateCustomerUseCase,
} from '@app/customer';
import { UpdateTokenPasswordUseCase } from '@app/token-password';
import { SecurityLoggerService } from '@infra/security';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordCustomerUseCase {
  constructor(
    private readonly findCustomerByEmailUseCase: FindCustomerByEmailUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
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
      const user = await this.findCustomerByEmailUseCase.execute(email);

      await this.updateCustomerUseCase.execute(user.id, {
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
