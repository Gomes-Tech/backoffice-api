import {
  AttributeValue,
  CreateAttributeValue,
  UpdateAttributeValue,
} from '../entities';

export abstract class AttributeValueRepository {
  abstract findAllByAttribute(attributeId: string): Promise<AttributeValue[]>;
  abstract findById(id: string): Promise<AttributeValue>;
  abstract findByName(name: string): Promise<AttributeValue>;
  abstract findByValue(value: string): Promise<AttributeValue>;
  abstract create(dto: CreateAttributeValue): Promise<void>;
  abstract update(id: string, dto: UpdateAttributeValue): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
