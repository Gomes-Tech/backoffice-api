import {
  FindCustomerByEmailUseCase,
  UpdateCustomerUseCase,
} from '@app/customer';
import { UpdateTokenPasswordUseCase } from '@app/token-password';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordCustomerUseCase {
  constructor(
    private readonly findCustomerByEmailUseCase: FindCustomerByEmailUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly updateTokenPasswordUseCase: UpdateTokenPasswordUseCase,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.findCustomerByEmailUseCase.execute(email);

    await this.updateCustomerUseCase.execute(user.id, {
      password,
    });

    await this.updateTokenPasswordUseCase.execute(user.email);
  }
}
