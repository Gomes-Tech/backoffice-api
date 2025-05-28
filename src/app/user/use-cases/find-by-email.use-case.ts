import { User, UserRepository } from '@domain/user';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string): Promise<User | null> {
    const userExist = await this.userRepository.findByEmail(email);

    if (!userExist) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    return userExist;
  }
}
