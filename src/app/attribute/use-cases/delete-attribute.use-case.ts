import { AttributeRepository } from '@domain/attribute';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteAttributeUseCase {
  constructor(
    @Inject('AttributeRepository')
    private readonly attributeRepository: AttributeRepository,
  ) {}

  async execute(attributeId: string, userId: string): Promise<void> {
    await this.attributeRepository.findById(attributeId);

    await this.attributeRepository.delete(attributeId, userId);
  }
}
