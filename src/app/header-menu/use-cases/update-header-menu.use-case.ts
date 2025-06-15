import { HeaderMenuRepository } from '@domain/header-menu';
import { UpdateHeaderMenuDTO } from '@interfaces/http';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateHeaderMenuUseCase {
  constructor(
    @Inject('HeaderMenuRepository')
    private readonly headerMenuRepository: HeaderMenuRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateHeaderMenuDTO,
    userId: string,
  ): Promise<void> {
    console.log(dto);
    await this.headerMenuRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
