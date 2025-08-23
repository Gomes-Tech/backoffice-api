import {
  AttributeValue,
  AttributeValueRepository,
} from '@domain/attribute-value';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllAttributeValueUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(): Promise<AttributeValue[]> {
    return await this.attributeValueRepository.findAll();
  }
}
