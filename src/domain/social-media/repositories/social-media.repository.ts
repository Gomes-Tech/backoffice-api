import { CreateSocialMedia, SocialMedia, UpdateSocialMedia } from '../entities';

export abstract class SocialMediaRepository {
  abstract findAll(): Promise<SocialMedia[]>;
  abstract findById(id: string): Promise<SocialMedia | null>;
  abstract create(dto: CreateSocialMedia): Promise<void>;
  abstract update(id: string, dto: UpdateSocialMedia): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
