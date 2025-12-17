import { StoreBenefit, StoreBenefitRepository } from '@domain/store-benefit';
import { NotFoundException } from '@infra/filters';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindStoreBenefitByIdUseCase {
  constructor(
    @Inject('StoreBenefitRepository')
    private readonly storeBenefitRepository: StoreBenefitRepository,
  ) {}

  async execute(id: string): Promise<StoreBenefit> {
    const benefit = await this.storeBenefitRepository.findById(id);

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado');
    }

    return benefit;
  }
}


