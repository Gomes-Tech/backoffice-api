import { UpdateTokenPasswordUseCase } from '@app/token-password';
import { FindUserByEmailUseCase, UpdateUserUseCase } from '@app/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateTokenPasswordUseCase: UpdateTokenPasswordUseCase,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.findUserByEmailUseCase.execute(email);

    await this.updateUserUseCase.execute(user.id, {
      password,
    });

    await this.updateTokenPasswordUseCase.execute(user.email);
  }
}
