import {
  AttributeValue,
  AttributeValueRepository,
} from '@domain/attribute-value';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllAttributeValueByAttributeUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(attributeId: string): Promise<AttributeValue[]> {
    return await this.attributeValueRepository.findAllByAttribute(attributeId);
  }
}
