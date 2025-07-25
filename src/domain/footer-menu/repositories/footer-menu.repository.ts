import { BaseRepository } from '@domain/common';
import {
  CreateFooterMenu,
  FooterMenu,
  ListFooterMenu,
  UpdateFooterMenu,
} from '../entities';

export abstract class FooterMenuRepository extends BaseRepository<
  FooterMenu,
  CreateFooterMenu,
  UpdateFooterMenu,
  ListFooterMenu
> {
  abstract getAll(): Promise<FooterMenu[]>;
}
