import { UserRepository } from '@domain/user';
import { CryptographyService } from '@infra/criptography';
import { BadRequestException } from '@infra/filters';
import { StorageService } from '@infra/providers';
import { UpdateUserDto } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';
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
  ): Promise<void> {
    const user = await this.FindUserByIdUseCase.execute(id);

    if (data.password) {
      const samePassword = await this.cryptographyService.compare(
        data.password,
        user.password,
      );

      if (samePassword) {
        throw new BadRequestException(
          'A nova senha não pode ser igual a senha atual',
        );
      }

      data.password = await this.cryptographyService.hash(data.password);
    }

    if (file) {
      let fileBuffer = file.buffer;
      let fileName = file.originalname;

      const { publicUrl } = await this.storageService.uploadFile(
        fileName,
        fileBuffer,
      );

      data.photo = publicUrl;
    }

    await this.userRepository.update(id, data);
  }
}
