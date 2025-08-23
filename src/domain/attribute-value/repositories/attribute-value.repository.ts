import { BaseRepository } from '@domain/common';
import {
  AttributeValue,
  AttributeValueWithAttribute,
  CreateAttributeValue,
  ListAttributeValue,
  UpdateAttributeValue,
} from '../entities';

export abstract class AttributeValueRepository extends BaseRepository<
  AttributeValue,
  CreateAttributeValue,
  UpdateAttributeValue,
  ListAttributeValue
> {
  abstract findAllByAttribute(attributeId: string): Promise<AttributeValue[]>;
  abstract findByName(name: string): Promise<AttributeValue>;
  abstract findByValue(value: string): Promise<AttributeValue>;
  abstract findWithAttributeId(
    atrrValueId: string,
  ): Promise<AttributeValueWithAttribute>;
}
