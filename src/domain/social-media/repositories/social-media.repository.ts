import { BaseRepository } from '@domain/common';
import {
  CreateSocialMedia,
  ListSocialMedia,
  SocialMedia,
  UpdateSocialMedia,
} from '../entities';

export abstract class SocialMediaRepository extends BaseRepository<
  SocialMedia,
  CreateSocialMedia,
  UpdateSocialMedia,
  SocialMedia,
  Omit<SocialMedia, 'createdBy' | 'createdAt'>
> {
  abstract list(): Promise<ListSocialMedia[]>;
}
