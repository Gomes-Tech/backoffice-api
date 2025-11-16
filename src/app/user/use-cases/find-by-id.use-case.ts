import { User, UserRepository } from '@domain/user';
import { NotFoundException } from '@infra/filters';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, requesterId?: string, requesterRole?: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Proteção contra IDOR: Verificar se o usuário autenticado tem permissão
    // Só permite se for o próprio usuário ou se for admin
    if (requesterId && requesterId !== id && requesterRole !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return user;
  }
}
