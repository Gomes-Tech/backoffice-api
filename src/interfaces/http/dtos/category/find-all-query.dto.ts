import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllCategoriesQueryDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  orderByField?: 'name' | 'createdAt' | 'isActive';

  @IsOptional()
  @IsString()
  orderByDirection?: 'asc' | 'desc';
}
