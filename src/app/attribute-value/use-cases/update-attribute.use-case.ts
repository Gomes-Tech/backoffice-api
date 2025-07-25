import { AttributeValueRepository } from '@domain/attribute-value';
import { UpdateAttributeValueDTO } from '@interfaces/http';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FindAttributeValueByIdUseCase } from './find-attribute-value-by-id.use-case';
import { FindAttributeValueByValueUseCase } from './find-attribute-value-by-value.use-case';

@Injectable()
export class UpdateAttributeValueUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
    private readonly findAttributeValueByIdUseCase: FindAttributeValueByIdUseCase,
    private readonly findAttributeValueByValueUseCase: FindAttributeValueByValueUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateAttributeValueDTO,
    userId: string,
  ): Promise<void> {
    const existingAttribute = await this.findAttributeValueByIdUseCase
      .execute(id)
      .catch(() => null);

    if (existingAttribute?.name === dto.name) {
      throw new NotFoundException('Já existe um valor atributo com esse nome!');
    }

    if (existingAttribute?.value === dto.value) {
      throw new NotFoundException(
        'Já existe um valor atributo com esse valor!',
      );
    }

    await this.attributeValueRepository.update(
      id,
      {
        ...dto,
        updatedBy: userId,
      },
      '',
    );
  }
}
