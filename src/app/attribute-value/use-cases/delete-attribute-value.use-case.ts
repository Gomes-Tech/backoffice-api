import { AttributeValueRepository } from '@domain/attribute-value';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteAttributeValueUseCase {
  constructor(
    @Inject('AttributeValueRepository')
    private readonly attributeValueRepository: AttributeValueRepository,
  ) {}

  async execute(attributeId: string, userId: string): Promise<void> {
    await this.attributeValueRepository.findById(attributeId);

    await this.attributeValueRepository.delete(attributeId, userId);
  }
}
