import { Banner, CreateBanner, ListBanner, UpdateBanner } from '../entities';

export abstract class BannerRepository {
  abstract findAll(): Promise<
    Omit<Banner, 'mobileImageKey' | 'desktopImageKey'>[]
  >;
  abstract findList(): Promise<ListBanner[]>;
  abstract findById(
    id: string,
  ): Promise<Omit<Banner, 'createdAt' | 'createdBy'> | null>;
  abstract create(dto: CreateBanner): Promise<void>;
  abstract update(id: string, dto: UpdateBanner): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
