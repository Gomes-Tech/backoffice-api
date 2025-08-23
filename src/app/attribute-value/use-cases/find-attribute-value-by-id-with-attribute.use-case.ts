import {
  AttributeValueRepository,
  AttributeValueWithAttribute,
} from '@domain/attribute-value';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAttributeValueByIdWithAttributeUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(id: string): Promise<AttributeValueWithAttribute> {
    const attributeValue =
      await this.attributeValueRepository.findWithAttributeId(id);

    if (!attributeValue) {
      throw new NotFoundException('Valor Atributo não encontrado');
    }

    return attributeValue;
  }
}
