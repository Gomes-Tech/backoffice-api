import { BaseRepository } from '@domain/common';
import { Attribute, CreateAttribute, UpdateAttribute } from '../entities';

export abstract class AttributeRepository extends BaseRepository<
  Attribute,
  CreateAttribute,
  UpdateAttribute
> {
  abstract findByName(name: string): Promise<Attribute>;
}
