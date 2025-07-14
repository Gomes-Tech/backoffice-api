import { AttributeValueRepository } from '@domain/attribute-value';
import { CreateAttributeValueDTO } from '@interfaces/http';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FindAttributeValueByNameUseCase } from './find-attribute-value-by-name.use-case';
import { FindAttributeValueByValueUseCase } from './find-attribute-value-by-value.use-case';

@Injectable()
export class CreateAttributeValueUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
    private readonly findAttributeValueByNameUseCase: FindAttributeValueByNameUseCase,
    private readonly findAttributeValueByValueUseCase: FindAttributeValueByValueUseCase,
  ) {}

  async execute(dto: CreateAttributeValueDTO, userId: string): Promise<void> {
    const existingAttributeName = await this.findAttributeValueByNameUseCase
      .execute(dto.name)
      .catch(() => null);

    const existingAttributeValue = await this.findAttributeValueByValueUseCase
      .execute(dto.value)
      .catch(() => null);

    if (existingAttributeName) {
      throw new NotFoundException('Já existe um valor atributo com esse nome!');
    }

    if (existingAttributeValue) {
      throw new NotFoundException(
        'Já existe um valor atributo com esse valor!',
      );
    }

    await this.attributeValueRepository.create({
      id: uuidv4(),
      createdBy: userId,
      ...dto,
    });
  }
}
