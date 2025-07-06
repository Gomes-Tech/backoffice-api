import { CreateTokenPasswordUseCase } from '@app/token-password';
import { FindUserByEmailUseCase } from '@app/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly createTokenPasswordUseCase: CreateTokenPasswordUseCase,
  ) {}

  async execute(email: string) {
    const user = await this.findUserByEmailUseCase.execute(email);

    await this.createTokenPasswordUseCase.execute(user.email);

    return {
      message: 'Foi enviado um código de recuperação para o seu email!',
    };
  }
}
