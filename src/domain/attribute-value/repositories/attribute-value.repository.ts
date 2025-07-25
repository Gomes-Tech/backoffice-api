import { BaseRepository } from '@domain/common';
import {
  AttributeValue,
  CreateAttributeValue,
  UpdateAttributeValue,
} from '../entities';

export abstract class AttributeValueRepository extends BaseRepository<
  AttributeValue,
  CreateAttributeValue,
  UpdateAttributeValue
> {
  abstract findAllByAttribute(attributeId: string): Promise<AttributeValue[]>;
  abstract findByName(name: string): Promise<AttributeValue>;
  abstract findByValue(value: string): Promise<AttributeValue>;
}
