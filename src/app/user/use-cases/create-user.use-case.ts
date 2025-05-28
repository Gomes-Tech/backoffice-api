import { User, UserRepository } from '@domain/user';
import { CryptographyService } from '@infra/criptography';
import { BadRequestException } from '@infra/filters';
import { CreateUserDto } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const passwordHashed = await this.cryptographyService.hash(dto.password);

    const user = new User(
      uuidv4(),
      dto.name,
      dto.email,
      passwordHashed,
      dto.role,
      null,
    );

    const newUser = await this.userRepository.create(user);

    if (!newUser) {
      throw new BadRequestException(
        'Ocorreu um erro ao criar o usuário! Tente novamente mais tarde!',
      );
    }

    return newUser;
  }
}
