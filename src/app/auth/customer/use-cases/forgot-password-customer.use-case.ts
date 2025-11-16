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
    // Proteção contra Enumeration Attack:
    // Sempre retornar sucesso, mesmo se email não existir
    // Não revelar se o email está cadastrado no sistema
    const customer = await this.findCustomerByEmailUseCase
      .execute(email)
      .catch(() => null);

    // Só criar token e enviar email se o customer existir
    if (customer) {
      await this.createTokenPasswordUseCase.execute(customer.email);
    }

    // SEMPRE retornar a mesma mensagem, independente se email existe ou não
    // Isso previne enumeration attacks e protege privacidade (LGPD)
    return {
      message:
        'Se o email estiver cadastrado, você receberá um código de recuperação!',
    };
  }
}
