import { AttributeRepository } from '@domain/attribute';
import { CreateAttributeDTO } from '@interfaces/http';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FindAttributeByNameUseCase } from './find-attribute-by-name.use-case';

@Injectable()
export class CreateAttributeUseCase {
  constructor(
    @Inject('AttributeRepository')
    private readonly attributeRepository: AttributeRepository,
    private readonly findAttributeByNameUseCase: FindAttributeByNameUseCase,
  ) {}

  async execute(dto: CreateAttributeDTO, userId: string): Promise<void> {
    const existingAttribute = await this.findAttributeByNameUseCase
      .execute(dto.name)
      .catch(() => null);

    if (existingAttribute) {
      throw new NotFoundException('Já existe um atributo com esse nome!');
    }

    await this.attributeRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
    });
  }
}
