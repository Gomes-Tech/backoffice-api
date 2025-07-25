import { BaseRepository } from '@domain/common';
import { Banner, CreateBanner, ListBanner, UpdateBanner } from '../entities';

export abstract class BannerRepository extends BaseRepository<
  Banner,
  CreateBanner,
  UpdateBanner,
  ListBanner
> {
  abstract findList(): Promise<ListBanner[]>;
}
