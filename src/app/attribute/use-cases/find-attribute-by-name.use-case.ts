import { Attribute, AttributeRepository } from '@domain/attribute';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAttributeByNameUseCase {
  constructor(
    @Inject('AttributeRepository')
    private readonly attributeRepository: AttributeRepository,
  ) {}

  async execute(name: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findByName(name);

    if (!attribute) {
      throw new NotFoundException('Atributo não encontrado');
    }

    return attribute;
  }
}
