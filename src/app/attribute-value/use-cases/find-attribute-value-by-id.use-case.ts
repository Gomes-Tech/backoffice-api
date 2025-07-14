import {
  AttributeValue,
  AttributeValueRepository,
} from '@domain/attribute-value';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAttributeValueByIdUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(id: string): Promise<AttributeValue> {
    const attributeValue = await this.attributeValueRepository.findById(id);

    if (!attributeValue) {
      throw new NotFoundException('Valor Atributo não encontrado');
    }

    return attributeValue;
  }
}
