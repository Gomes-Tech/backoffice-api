import {
  AttributeValue,
  AttributeValueRepository,
} from '@domain/attribute-value';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAttributeValueByValueUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(value: string): Promise<AttributeValue> {
    const attribute = await this.attributeValueRepository.findByValue(value);

    if (!attribute) {
      throw new NotFoundException('Valor Atributo não encontrado');
    }

    return attribute;
  }
}
