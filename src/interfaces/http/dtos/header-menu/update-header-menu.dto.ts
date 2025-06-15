import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateHeaderMenuDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  link: string;

  @IsOptional()
  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
