import { CreateUserUseCase, FindUserByEmailUseCase } from '@app/user';
import { BadRequestException } from '@infra/filters';
import { CreateUserDto, UserResponseDTO } from '@interfaces/http';
import { Injectable } from '@nestjs/common';
import { SignInUserUseCase } from './sign-in.use-case';

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly signInUserUseCase: SignInUserUseCase,
  ) {}
  async execute(data: CreateUserDto): Promise<Output> {
    const userExisting = await this.findUserByEmail.execute(data.email);

    if (userExisting) {
      throw new BadRequestException('Usuário já existe!');
    }

    const newUser = await this.createUserUseCase.execute(data);

    return await this.signInUserUseCase.execute({
      email: newUser.email,
      password: data.password,
    });
  }
}

type Output = {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDTO;
};
