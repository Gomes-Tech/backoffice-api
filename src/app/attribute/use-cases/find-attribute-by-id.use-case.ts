import { Attribute, AttributeRepository } from '@domain/attribute';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAttributeByIdUseCase {
  constructor(
    @Inject('AttributeRepository')
    private readonly attributeRepository: AttributeRepository,
  ) {}

  async execute(id: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findById(id);

    if (!attribute) {
      throw new NotFoundException('Atributo não encontrado');
    }

    return attribute;
  }
}
