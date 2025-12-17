import { StoreBenefit, StoreBenefitRepository } from '@domain/store-benefit';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListStoreBenefitUseCase {
  constructor(
    @Inject('StoreBenefitRepository')
    private readonly storeBenefitRepository: StoreBenefitRepository,
  ) {}

  async execute(): Promise<StoreBenefit[]> {
    return await this.storeBenefitRepository.list();
  }
}


