import { UserRepository } from '@domain/user';
import { CryptographyService } from '@infra/criptography';
import { BadRequestException } from '@infra/filters';
import { StorageService } from '@infra/providers';
import { UpdateUserDto } from '@interfaces/http';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { FindUserByIdUseCase } from './find-by-id.use-case';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly FindUserByIdUseCase: FindUserByIdUseCase,
    private readonly cryptographyService: CryptographyService,
    private readonly storageService: StorageService,
  ) {}

  async execute(
    id: string,
    data: UpdateUserDto,
    file?: Express.Multer.File,
    requesterId?: string,
    requesterRole?: string,
  ): Promise<void> {
    // Proteção contra IDOR: Verificar se o usuário autenticado tem permissão
    // Só permite se for o próprio usuário ou se for admin
    if (requesterId && requesterId !== id && requesterRole !== 'admin') {
      throw new ForbiddenException(
        'Você não tem permissão para modificar este recurso',
      );
    }

    const user = await this.FindUserByIdUseCase.execute(
      id,
      requesterId,
      requesterRole,
    );

    if (data.password) {
      const samePassword = await this.cryptographyService.compare(
        data.password,
        user.password,
      );

      if (samePassword) {
        throw new BadRequestException(
          'Utilize uma senha não usada anteriormente!',
        );
      }

      data.password = await this.cryptographyService.hash(data.password);
    }

    if (file) {
      let fileBuffer = file.buffer;
      let fileName = file.originalname;

      const { publicUrl } = await this.storageService.uploadFile(
        'users',
        fileName,
        fileBuffer,
      );

      data.photo = publicUrl;
    }

    await this.userRepository.update(id, data, '');
  }
}
