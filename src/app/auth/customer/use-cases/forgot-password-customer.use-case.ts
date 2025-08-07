import { FindCustomerByEmailUseCase } from '@app/customer';
import { CreateTokenPasswordUseCase } from '@app/token-password';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ForgotPasswordCustomerUseCase {
  constructor(
    private readonly findCustomerByEmailUseCase: FindCustomerByEmailUseCase,
    private readonly createTokenPasswordUseCase: CreateTokenPasswordUseCase,
  ) {}

  async execute(email: string) {
    const customer = await this.findCustomerByEmailUseCase.execute(email);

    await this.createTokenPasswordUseCase.execute(customer.email);

    return {
      message: 'Foi enviado um código de recuperação para o seu email!',
    };
  }
}
