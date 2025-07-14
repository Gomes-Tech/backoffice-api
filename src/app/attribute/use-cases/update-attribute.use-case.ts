import { AttributeRepository } from '@domain/attribute';
import { UpdateAttributeDTO } from '@interfaces/http';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FindAttributeByNameUseCase } from './find-attribute-by-name.use-case';

@Injectable()
export class UpdateAttributeUseCase {
  constructor(
    @Inject('AttributeRepository')
    private readonly attributeRepository: AttributeRepository,
    private readonly findAttributeByNameUseCase: FindAttributeByNameUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateAttributeDTO,
    userId: string,
  ): Promise<void> {
    const existingAttribute = await this.findAttributeByNameUseCase
      .execute(dto.name)
      .catch(() => null);

    if (existingAttribute) {
      throw new NotFoundException('Já existe um atributo com esse nome!');
    }

    await this.attributeRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }
}
