import { StoreBenefitRepository } from '@domain/store-benefit';
import { CacheService } from '@infra/cache';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteStoreBenefitUseCase {
  constructor(
    @Inject('StoreBenefitRepository')
    private readonly storeBenefitRepository: StoreBenefitRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.storeBenefitRepository.findById(id);
    await this.storeBenefitRepository.delete(id, userId);
    await this.cacheService.del('store_benefits');
  }
}


