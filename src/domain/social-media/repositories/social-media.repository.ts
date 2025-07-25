import { BaseRepository } from '@domain/common';
import { CreateSocialMedia, SocialMedia, UpdateSocialMedia } from '../entities';

export abstract class SocialMediaRepository extends BaseRepository<
  SocialMedia,
  CreateSocialMedia,
  UpdateSocialMedia,
  SocialMedia,
  Omit<SocialMedia, 'createdBy' | 'createdAt'>
> {}
