export abstract class BaseRepository<
  Entity,
  CreateDTO = unknown,
  UpdateDTO = unknown,
  FindAllResult = Entity,
  FindByIdResult = Entity,
  CreateReturn = void,
  UpdateReturn = void,
> {
  abstract findAll(): Promise<FindAllResult[]>;
  abstract findById(id: string): Promise<FindByIdResult>;
  abstract create(dto: CreateDTO, createdBy?: string): Promise<CreateReturn>;
  abstract update(
    id: string,
    dto: UpdateDTO,
    userId: string,
  ): Promise<UpdateReturn>;
  abstract delete(id: string, userId: string): Promise<void>;
}
