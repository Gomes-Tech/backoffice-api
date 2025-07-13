import { ListUser, UserRepository } from '@domain/user';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<ListUser[]> {
    const users = await this.userRepository.findAll();

    return users;
  }
}
