import { UserRepository } from '@domain/user';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const SocialMedia = await this.userRepository.findById(id);

    if (!SocialMedia) {
      throw new Error(`Esse usuário não foi encontrado: ${id}`);
    }

    await this.userRepository.delete(id);
  }
}
