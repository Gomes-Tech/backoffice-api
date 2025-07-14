import { Attribute, AttributeRepository } from '@domain/attribute';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllAttributeUseCase {
  constructor(
    @Inject('AttributeRepository')
    private readonly attributeRepository: AttributeRepository,
  ) {}

  async execute(): Promise<Attribute[]> {
    return await this.attributeRepository.findAll();
  }
}
