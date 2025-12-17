import { ListStoreBenefit, StoreBenefitRepository } from '@domain/store-benefit';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllStoreBenefitUseCase {
  constructor(
    @Inject('StoreBenefitRepository')
    private readonly storeBenefitRepository: StoreBenefitRepository,
  ) {}

  async execute(): Promise<ListStoreBenefit[]> {
    return await this.storeBenefitRepository.findAll();
  }
}


