import {
  CreateCustomerUseCase,
  FindCustomerByEmailUseCase,
  FindCustomerByTaxIdentifierUseCase,
} from '@app/customer';
import { BadRequestException } from '@infra/filters';
import { CreateCustomerDTO } from '@interfaces/http';
import { Injectable } from '@nestjs/common';
import { SignInCustomerUseCase } from './sign-in.use-case';

@Injectable()
export class SignUpCustomerUseCase {
  constructor(
    private readonly findCustomerByEmail: FindCustomerByEmailUseCase,
    private readonly findCustomerByTaxIdentifierUseCase: FindCustomerByTaxIdentifierUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly signInCustomerUseCase: SignInCustomerUseCase,
  ) {}
  async execute(data: CreateCustomerDTO): Promise<Output> {
    const userExisting = await this.findCustomerByEmail
      .execute(data.email)
      .catch(() => null);

    const userTaxExisting = await this.findCustomerByTaxIdentifierUseCase
      .execute(data.taxIdentifier)
      .catch(() => null);

    if (userExisting || userTaxExisting) {
      throw new BadRequestException('Usuário já existe!');
    }

    await this.createCustomerUseCase.execute(data);

    return await this.signInCustomerUseCase.execute({
      email: data.email,
      password: data.password,
    });
  }
}

type Output = {
  accessToken: string;
  refreshToken: string;
};
