import {
  AttributeValue,
  AttributeValueRepository,
} from '@domain/attribute-value';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAttributeValueByNameUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(name: string): Promise<AttributeValue> {
    const attributeValue = await this.attributeValueRepository.findByName(name);

    if (!attributeValue) {
      throw new NotFoundException('Valor Atributo não encontrado');
    }

    return attributeValue;
  }
}
