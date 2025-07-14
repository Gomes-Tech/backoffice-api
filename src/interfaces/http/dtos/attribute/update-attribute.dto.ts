import { IsOptional, IsString } from 'class-validator';

export class UpdateAttributeDTO {
  @IsOptional()
  @IsString()
  name: string;
}
