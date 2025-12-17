import { BaseRepository } from '@domain/common';
import {
  CreateStoreBenefit,
  ListStoreBenefit,
  StoreBenefit,
  UpdateStoreBenefit,
} from '../entities';

export abstract class StoreBenefitRepository extends BaseRepository<
  StoreBenefit,
  CreateStoreBenefit,
  UpdateStoreBenefit,
  ListStoreBenefit
> {
  abstract list(): Promise<StoreBenefit[]>;
}


