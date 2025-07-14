import { Attribute, CreateAttribute, UpdateAttribute } from '../entities';

export abstract class AttributeRepository {
  abstract findAll(): Promise<Attribute[]>;
  abstract findById(id: string): Promise<Attribute>;
  abstract findByName(name: string): Promise<Attribute>;
  abstract create(dto: CreateAttribute): Promise<void>;
  abstract update(id: string, dto: UpdateAttribute): Promise<void>;
  abstract delete(id: string, userId: string): Promise<void>;
}
